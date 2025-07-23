import { type App } from '@canvex/core';

import { type Rect } from './geometry';

export function centerToViewport(app: App, rect: Rect): void {
  app.viewport.x =
    rect.x + (rect.width - app.viewport.width / app.viewport.zoom) / 2;
  app.viewport.y =
    rect.y + (rect.height - app.viewport.height / app.viewport.zoom) / 2;
}
