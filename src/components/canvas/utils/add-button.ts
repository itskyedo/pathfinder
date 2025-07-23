import { type Node } from '@canvex/extension-fishbone-diagram';

import { type Rect } from './geometry';

export function getAddButtonRect(
  node: Node,
  position: 'top' | 'bottom' | 'left',
): Rect {
  const width = 24;
  const height = 24;
  const spacing = 10;

  if (position === 'top') {
    return {
      x: node.mx - spacing,
      y: node.y1 - height - spacing,
      width,
      height,
    };
  } else if (position === 'bottom') {
    return {
      x: node.mx - spacing,
      y: node.y2 + spacing,
      width,
      height,
    };
  } else {
    return {
      x: node.x - width - spacing,
      y: node.my - height / 2,
      width,
      height,
    };
  }
}

export function renderAddButton(
  context: CanvasRenderingContext2D,
  rect: Rect,
): void {
  context.save();

  const padding = 6;

  context.fillStyle = '#2828B1';
  context.strokeStyle = 'rgba(255 255 255 / 20%)';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(rect.x, rect.y);
  context.roundRect(
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    rect.width + rect.height,
  );
  context.closePath();
  context.fill();
  context.stroke();

  context.strokeStyle = '#ffffff';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(rect.x + rect.width / 2, rect.y + padding);
  context.lineTo(rect.x + rect.width / 2, rect.y + rect.height - padding);
  context.moveTo(rect.x + padding, rect.y + rect.height / 2);
  context.lineTo(rect.x + rect.width - padding, rect.y + rect.height / 2);

  context.closePath();
  context.stroke();

  context.restore();
}
