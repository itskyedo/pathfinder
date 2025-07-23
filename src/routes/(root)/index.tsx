import { type RouteSectionProps } from '@solidjs/router';

import Logo from '~/components/logo';

import styles from './index.module.css';

export default function HomePage(props: RouteSectionProps) {
  return (
    <div class={styles.root}>
      <Logo class={styles.logo} />
    </div>
  );
}
