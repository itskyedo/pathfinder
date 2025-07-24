import { type App, type ExtensionEvents } from '@canvex/core';
import DragPanZoomExtension from '@canvex/extension-drag-pan-zoom';

export class CustomDragPanZoomExtension extends DragPanZoomExtension {
  override addHooks(app: App): Partial<ExtensionEvents> {
    const superHooks = super.addHooks(app);

    return {
      ...superHooks,

      mouseDown: (event) => {
        const { nativeEvent } = event;

        if (
          nativeEvent.target === app.storage.canvas.element &&
          nativeEvent.buttons === 1
        ) {
          const anchor = {
            x: app.storage.mouse.x,
            y: app.storage.mouse.y,
            clientX: nativeEvent.clientX,
            clientY: nativeEvent.clientY,
            viewportX: app.viewport.x,
            viewportY: app.viewport.y,
          };

          app.storage.dragPanZoom.anchor = anchor;
        } else {
          superHooks.mouseDown?.(event);
        }
      },

      mouseMove: (event) => {
        const { nativeEvent } = event;
        let { anchor } = app.storage.dragPanZoom;

        const mouseUpOutsideWindow =
          anchor && nativeEvent.buttons !== 4 && nativeEvent.buttons !== 1;
        if (mouseUpOutsideWindow) {
          anchor = null;
          app.storage.dragPanZoom.anchor = anchor;
        }

        if (anchor) {
          const dx = nativeEvent.clientX - anchor.clientX;
          const dy = nativeEvent.clientY - anchor.clientY;
          app.viewport.x = anchor.viewportX - dx / app.viewport.zoom;
          app.viewport.y = anchor.viewportY - dy / app.viewport.zoom;

          app.dispatchEvent({
            type: 'pan',
            anchor: {
              ...anchor,
            },
          });
        }
      },
    };
  }
}
