import {
  type RouteSectionProps,
  createAsync,
  useAction,
  useLocation,
} from '@solidjs/router';
import { For, Show } from 'solid-js';

import Icon from '~/components/icon';
import Logo from '~/components/logo';
import { createDiagram } from '~/queries/create-diagram';
import { getDiagrams } from '~/queries/get-diagrams';
import { cn } from '~/utils/cn';

import styles from './(root).module.css';

export default function RootLayout(props: RouteSectionProps) {
  const diagramsResponse = createAsync(() => getDiagrams(), {
    deferStream: true,
  });

  const location = useLocation();

  // Should use a submission and restrict user from clicking when
  // the state is pending.
  const create = useAction(createDiagram);

  const handleCreateDiagramClick = () => {
    // With more time, I would've used a dedicated flow instead of relying on `prompt`.
    // eslint-disable-next-line no-alert
    const name = prompt('Enter name for the diagram.');
    if (name) {
      create(name).catch((error) => console.error(error));
    }
  };

  return (
    <div class={styles.root}>
      <aside class={styles.leftSidebar}>
        <Logo class={styles.logo} />

        <div class={styles.searchBox}>
          <Icon icon="magnifying-glass" class={styles.icon} />
          <input type="text" placeholder="Search anything" />
        </div>

        <nav class={styles.specialNav}>
          <ul>
            <li>
              <span class={cn(styles.navItem, 'disabled')}>
                <Icon icon="tray" class={styles.icon} /> Inbox
              </span>
            </li>
            <li>
              <span class={cn(styles.navItem, 'disabled')}>
                <Icon icon="rss-simple" class={styles.icon} /> Activity
              </span>
            </li>
            <li>
              <span class={cn(styles.navItem, 'disabled')}>
                <Icon icon="gear-fine" class={styles.icon} /> Settings
              </span>
            </li>
          </ul>
        </nav>

        <nav>
          <h2 class={styles.label}>Opened</h2>
          <ul>
            <li>
              <span class={cn(styles.navItem, styles.mono, 'disabled')}>
                <Icon icon="file" class={styles.icon} /> Untitled 1
              </span>
            </li>
            <li>
              <span class={cn(styles.navItem, styles.mono, 'disabled')}>
                <Icon icon="file" class={styles.icon} /> Untitled 2
              </span>
            </li>
          </ul>
        </nav>

        <nav>
          <div class={styles.navHeading}>
            <h2 class={styles.label}>Diagrams</h2>
            <div onClick={handleCreateDiagramClick}>
              <Icon icon="plus" class={styles.createDiagramButton} />
            </div>
          </div>
          <Show when={diagramsResponse()?.result}>
            {(diagrams) => (
              <ul>
                <For each={diagrams()}>
                  {(diagram) => (
                    <li>
                      <a
                        class={cn(
                          styles.navItem,
                          styles.mono,
                          location.pathname === `/diagram/${diagram.id}`
                            ? styles.active
                            : null,
                        )}
                        href={`/diagram/${diagram.id}`}>
                        <Icon icon="file" class={styles.icon} /> {diagram.name}
                      </a>
                    </li>
                  )}
                </For>
              </ul>
            )}
          </Show>
        </nav>
      </aside>

      <main class={styles.content}>{props.children}</main>
    </div>
  );
}
