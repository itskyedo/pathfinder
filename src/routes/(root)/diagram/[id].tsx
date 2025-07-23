import { type RouteSectionProps, createAsync } from '@solidjs/router';
import { clientOnly } from '@solidjs/start';
import { Show } from 'solid-js';

import Icon from '~/components/icon';
import { getDiagramById } from '~/queries/get-diagram-by-id';

import styles from './[id].module.css';

const Canvas = clientOnly(() => import('~/components/canvas'));

export default function DiagramPage(props: RouteSectionProps) {
  const diagramResponse = createAsync(
    () =>
      typeof props.params.id === 'string'
        ? getDiagramById(props.params.id)
        : Promise.resolve(null),
    { deferStream: true },
  );
  return (
    <Show when={diagramResponse()}>
      {(response) => (
        <Show when={response().result} fallback="Not found">
          {(diagram) => (
            <div class={styles.root}>
              <div class={styles.topBar}>
                <ul class={styles.breadcrumbs}>
                  <li>Diagrams</li>
                  <li>/</li>
                  <li>{diagram().name}</li>
                </ul>

                <div class={styles.right}>
                  <ul class={styles.users}>
                    <li class="disabled" style={{ background: '#da8f3a' }}>
                      KH
                    </li>
                    <li class="disabled" style={{ background: '#3a65da' }}>
                      AH
                    </li>
                    <li class="disabled" style={{ background: '#d73ada' }}>
                      JD
                    </li>
                  </ul>

                  <div class={styles.separator} />

                  <div class={styles.diagramButtons}>
                    <button class="disabled" type="button">
                      <Icon icon="gear" />
                    </button>
                    <button class="disabled" type="button" disabled={true}>
                      <Icon icon="note" />
                    </button>
                  </div>
                </div>
              </div>

              <Canvas diagram={diagram()} />
            </div>
          )}
        </Show>
      )}
    </Show>
  );
}
