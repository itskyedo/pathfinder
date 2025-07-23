import { type JSX } from 'solid-js';

import Icon from '~/components/icon';
import { cn } from '~/utils/cn';

import styles from './styles.module.css';

export interface LogoProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export default function Logo(props: LogoProps) {
  return (
    <div {...props} class={cn(styles.root, props.class)}>
      <Icon icon="line-segments" variant="bold" />
      <span>PATHFINDER</span>
    </div>
  );
}
