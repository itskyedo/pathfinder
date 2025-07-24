import { App } from '@canvex/core';
import FishboneDiagramExtension, {
  type CategoryNodeBuilder,
  type CauseNodeBuilder,
  type DiagramBuilder,
  type Node,
  NodeType,
} from '@canvex/extension-fishbone-diagram';
import FpsCounterExtension from '@canvex/extension-fps-counter';
import HTMLCanvasExtension from '@canvex/extension-html-canvas';
import MouseExtension from '@canvex/extension-mouse';
import PatternExtension from '@canvex/extension-pattern';
import { useAction } from '@solidjs/router';
import {
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  untrack,
} from 'solid-js';
import { v4 as uuidv4 } from 'uuid';

import { CustomDragPanZoomExtension } from '~/extensions/drag-pan-zoom/extension';
import ResizeObserverExtension from '~/extensions/resize-observer';
import { addNode } from '~/queries/add-node';
import { deleteNode } from '~/queries/delete-node';
import { type DiagramWithNodesData } from '~/services/db';

import { updateNodeText } from '../../queries/update-node-text';

import styles from './styles.module.css';
import { getAddButtonRect, renderAddButton } from './utils/add-button';
import { centerToViewport } from './utils/center-viewport-to-node';
import { findNodeAtPoint } from './utils/find-node-at-point';
import { findNodeById } from './utils/find-node-by-id';
import { isPointInRect } from './utils/geometry';
import { relativeRatio } from './utils/relative-ratio';

export interface CanvasProps {
  diagram: DiagramWithNodesData;
}

export default function Canvas(props: CanvasProps) {
  // The canvas state should be moved to a store inside of a context.
  // On top of that, a lot of the logic should be modularized so this
  // component is pure.

  let canvasRef!: HTMLCanvasElement;
  let canvasRootRef!: HTMLDivElement;
  let app!: App;
  let hoveredNode: Node | undefined;
  let focusedNode: Node | undefined;
  let previousDiagramId: string;

  const [fishbone, setFishbone] = createSignal<DiagramBuilder | null>(null);

  const updateAction = useAction(updateNodeText);
  const deleteAction = useAction(deleteNode);
  const addAction = useAction(addNode);

  function updateLayout() {
    const diagram = untrack(fishbone);
    diagram?.layout();

    const effect = diagram?.children[0];
    if (effect) {
      if (focusedNode?.id) {
        focusedNode = findNodeById(effect, focusedNode.id);
      }
      if (hoveredNode?.id) {
        hoveredNode = findNodeById(effect, hoveredNode.id);
      }
    }
  }

  onMount(() => {
    const measuringContext = new OffscreenCanvas(0, 0).getContext('2d')!;

    app = new App({
      extensions: [
        new HTMLCanvasExtension({
          element: canvasRef,
          contextSettings: {
            alpha: false,
          },
        }),

        new ResizeObserverExtension({
          rootElement: canvasRootRef,
        }),

        new MouseExtension({}),

        new CustomDragPanZoomExtension({
          minZoom: 0.1,
          maxZoom: 3,
        }),

        new PatternExtension({}),

        new FishboneDiagramExtension({
          measureText(text, style) {
            measuringContext.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            return measuringContext.measureText(text);
          },
        }),

        new FpsCounterExtension({}),
      ],
    });

    let doubleClickTimer: NodeJS.Timeout | undefined;
    let clicks: number = 0;

    app.addEventListener('mouseAny', (event) => {
      const diagram = untrack(fishbone);
      const effect = diagram?.children[0];
      hoveredNode = effect ? findNodeAtPoint(effect, event) : undefined;
    });

    app.addEventListener('mouseDown', (event) => {
      const diagram = untrack(fishbone);

      if (doubleClickTimer) {
        clearTimeout(doubleClickTimer);
      }

      const leftClickedOnCanvas =
        event.nativeEvent.target === app.storage.canvas.element &&
        event.button1;
      if (!leftClickedOnCanvas) {
        return;
      }

      clicks += 1;
      doubleClickTimer = setTimeout(() => {
        clicks = 0;
      }, 150);

      let newNode: Node | undefined;
      if (focusedNode) {
        if (focusedNode.type === NodeType.Effect) {
          if (isPointInRect(event, getAddButtonRect(focusedNode, 'top'))) {
            newNode = focusedNode
              .addNode({ id: uuidv4(), text: 'Untitled', direction: 'top' })
              .children.at(-1);
          } else if (
            isPointInRect(event, getAddButtonRect(focusedNode, 'bottom'))
          ) {
            newNode = focusedNode
              .addNode({ id: uuidv4(), text: 'Untitled', direction: 'bottom' })
              .children.at(-1);
          }
        } else if (
          isPointInRect(event, getAddButtonRect(focusedNode, 'left'))
        ) {
          newNode = focusedNode
            .addNode({ id: uuidv4(), text: 'Untitled' })
            .children.at(-1);
        }
      }

      if (newNode) {
        app.storage.dragPanZoom.anchor = null;

        focusedNode = newNode;
        updateLayout();
        centerToViewport(app, newNode);

        addAction({
          id: newNode.id!,
          diagramId: untrack(() => props.diagram.id),
          parentId: (newNode.parent as Node).id ?? null,
          type: newNode.type,
          text: newNode.text,
          order: newNode.parent.children.length,
          attributes:
            newNode.type === NodeType.Category
              ? { direction: newNode.direction }
              : undefined,
        })
          .then(() => {
            updateLayout();
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        const effect = diagram?.children[0];
        const newFocusedNode = effect
          ? findNodeAtPoint(effect, event)
          : undefined;

        if (focusedNode !== newFocusedNode) {
          focusedNode = newFocusedNode;
        } else if (focusedNode && clicks >= 2) {
          // With more time, I would've used a dedicated flow instead of relying on `prompt`.
          // eslint-disable-next-line no-alert
          const newText = prompt('Enter a new text', focusedNode.text);
          if (newText === null) {
            // Do nothing
          } else if (newText.length === 0) {
            deleteFocusedNode();
          } else {
            changeFocusedNodeText(newText);
          }
        }
      }
    });

    function handleKeyDown(event: KeyboardEvent): void {
      const isDeleteKey =
        event.target === app.storage.canvas.element &&
        (event.key === 'Delete' || event.key === 'Backspace');
      if (isDeleteKey) {
        if (focusedNode && focusedNode.type !== NodeType.Effect) {
          deleteFocusedNode();
        }
      }
    }

    function changeFocusedNodeText(value: string) {
      if (focusedNode?.id) {
        focusedNode.text = value;
        updateAction(focusedNode.id, value).catch((error) =>
          console.log(error),
        );
        updateLayout();
      }
    }

    function deleteFocusedNode() {
      if (focusedNode?.id && focusedNode.type !== NodeType.Effect) {
        const nodeIndex = focusedNode.parent.children.findIndex(
          (node) => node === focusedNode,
        );
        (focusedNode.parent.children as any[]).splice(nodeIndex, 1);

        deleteAction(focusedNode.id)
          .then(() => {
            focusedNode = undefined;
            hoveredNode = undefined;
            updateLayout();
          })
          .catch((error) => console.log(error));
      }
    }

    app.addEventListener('preRender', (event) => {
      const { context } = app.storage.canvas;

      context.save();

      // Background
      context.fillStyle = '#0E0E10';
      const background = new Path2D();
      background.rect(
        app.viewport.x,
        app.viewport.y,
        app.viewport.width / app.viewport.zoom,
        app.viewport.height / app.viewport.zoom,
      );
      background.closePath();
      context.fill(background);

      // Grid
      if (app.viewport.zoom >= 0.5) {
        const alpha = Math.min(1, relativeRatio(app.viewport.zoom, 0.5, 0.7));
        context.fillStyle = `rgba(55, 55, 56, ${alpha})`; // #373738

        const dotGrid = app.commands.createDotGrid({
          x: app.viewport.x,
          y: app.viewport.y,
          width: app.viewport.width / app.viewport.zoom,
          height: app.viewport.height / app.viewport.zoom,
          gap: 20,
          dotRadius: 1,
        });

        context.fill(dotGrid);
      }

      context.restore();
    });

    app.addEventListener('render', (event) => {
      const diagram = untrack(fishbone);

      const { context } = app.storage.canvas;

      diagram?.render(context);

      if (hoveredNode) {
        context.save();
        context.lineWidth = 2;
        context.strokeStyle = 'cyan';
        context.beginPath();
        context.rect(
          hoveredNode.x,
          hoveredNode.y,
          hoveredNode.width,
          hoveredNode.height,
        );
        context.closePath();
        context.stroke();
      }

      if (focusedNode) {
        context.save();
        context.lineWidth = 2;
        context.strokeStyle = 'cyan';
        context.beginPath();
        context.rect(
          focusedNode.x,
          focusedNode.y,
          focusedNode.width,
          focusedNode.height,
        );
        context.closePath();
        context.stroke();

        if (focusedNode?.type === NodeType.Effect) {
          const topButtonRect = getAddButtonRect(focusedNode, 'top');
          const bottomButtonRect = getAddButtonRect(focusedNode, 'bottom');
          renderAddButton(context, topButtonRect);
          renderAddButton(context, bottomButtonRect);
        } else {
          const buttonRect = getAddButtonRect(focusedNode, 'left');
          renderAddButton(context, buttonRect);
        }

        context.restore();
      }
    });

    // Wait until layout has been flushed by browser
    window.requestAnimationFrame(() => {
      // Only necessary because of FOUC in dev mode
      let readyTimer: NodeJS.Timeout | undefined;
      const readyCheck: Promise<boolean> = new Promise((resolve, reject) => {
        readyTimer = setInterval(() => {
          if (document.fonts.check('12px Geist Variable')) {
            if (readyTimer) clearInterval(readyTimer);
            resolve(true);
          }
        }, 10);
      });

      readyCheck
        .then(() => {
          const diagram = untrack(fishbone);
          const effect = diagram?.children[0];
          if (effect) {
            updateLayout();

            app.viewport.x = effect.outer.x2 - app.viewport.width + 60;
            app.viewport.y = effect.my - app.viewport.height / 2;
          }

          app.commands.startLoop();
        })
        .catch((error) => console.log(error));
    });

    window.addEventListener('keydown', handleKeyDown);

    onCleanup(() => {
      app.unmount();
      window.removeEventListener('keydown', handleKeyDown);
    });
  });

  createEffect(() => {
    // This is widly inefficient but at least it works.
    // Given more time, this would be rewritten and split
    // into their respective logic groups.

    const effect = props.diagram.nodes.find(
      (node) => node.type === NodeType.Effect,
    );
    if (!effect) {
      setFishbone(null);
      return;
    }

    const categories = props.diagram.nodes
      .filter((node) => node.type === NodeType.Category)
      .sort((a, b) => a.order - b.order);

    const causes = props.diagram.nodes
      .filter((node) => node.type === NodeType.Cause)
      .sort((a, b) => a.order - b.order);

    const diagram = app.commands.buildFishboneDiagram({
      styles: {
        effect: {
          fontFamily: 'Geist Variable, sans-serif',
          fontSize: '14.224px',
          fontWeight: 400,
          backgroundColor: '#b16328',
          foregroundColor: '#ffffff',
          borderColor: '#ffffff',
          borderLineWidth: 1,
          tailSize: 20,
          spinePadding: 40,
          horizontalPadding: 24,
          verticalPadding: 18,
          tailColor: '#ffffff',
          spineColor: '#ffffff',
          spineLineWidth: 2,
        },

        category: {
          fontFamily: 'Geist Variable, sans-serif',
          fontSize: '14.224px',
          fontWeight: 400,
          backgroundColor: '#2c2c36',
          foregroundColor: '#ffffff',
          borderColor: '#ffffff',
          borderLineWidth: 1,
          horizontalPadding: 18,
          verticalPadding: 12,
          connectorColor: '#ffffff',
        },

        cause: {
          fontFamily: 'Geist Variable, sans-serif',
          fontSize: '14.224px',
          fontWeight: 400,
          backgroundColor: '#0e0e10',
          foregroundColor: '#ffffff',
          borderColor: '#4a4a4a',
          borderLineWidth: 1,
          horizontalPadding: 18,
          verticalPadding: 12,
        },
      },
    });

    const addCauses = (parent: CauseNodeBuilder | CategoryNodeBuilder) => {
      const children = causes.filter((node) => node.parent_id === parent.id);

      for (const child of children) {
        addCauses(parent.addNode({ id: child.id, text: child.text }).descend());
      }
    };

    const effectNode = diagram
      .addNode({ id: effect.id, text: effect.text })
      .descend();

    for (const category of categories) {
      const categoryNode = effectNode
        .addNode({
          id: category.id,
          text: category.text,
          direction:
            // We haven't implemented parsing yet so this is hacky workaround
            ((
              JSON.parse(category.attributes as unknown as string) as Record<
                any,
                any
              >
            ).direction as 'top' | 'bottom' | undefined) ?? 'top',
        })
        .descend();

      addCauses(categoryNode);
    }
    setFishbone(diagram);

    if (props.diagram.id !== previousDiagramId) {
      hoveredNode = undefined;
      focusedNode = undefined;

      window.requestAnimationFrame(() => {
        updateLayout();

        app.viewport.x = effectNode.outer.x2 - app.viewport.width + 60;
        app.viewport.y = effectNode.my - app.viewport.height / 2;
      });
    }

    previousDiagramId = props.diagram.id;
  });

  return (
    <div ref={canvasRootRef} class={styles.root}>
      <canvas ref={canvasRef} tabindex="0" />
    </div>
  );
}
