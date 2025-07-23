import { type App, Extension, type ExtensionEvents } from '@canvex/core';
import HTMLCanvasExtension from '@canvex/extension-html-canvas';

export interface ResizeObserverOptions {
  rootElement: HTMLElement;
}

export default class ResizeObserverExtension extends Extension<
  'resizeObserver',
  ResizeObserverOptions
> {
  readonly name = 'resizeObserver';

  override dependencies = [HTMLCanvasExtension];

  override addStorage(app: App): void {}

  override addHooks(app: App): Partial<ExtensionEvents> {
    const superHooks = super.addHooks(app);

    let resizeTimeout: NodeJS.Timeout | undefined;
    const resizeObserver = new ResizeObserver((entries) => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        entries.forEach((entry) => {
          if (entry.target === this.options.rootElement) {
            app.commands.resizeCanvasToFill();
          } else {
            resizeObserver.unobserve(entry.target);
          }
        });
      }, 0);
    });

    return {
      ...superHooks,

      mount: (event) => {
        superHooks.mount?.(event);

        resizeObserver.observe(this.options.rootElement);
      },

      unmount: (event) => {
        superHooks.unmount?.(event);

        resizeObserver.disconnect();
      },
    };
  }
}
