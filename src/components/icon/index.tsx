import { type JSX, type Ref, mergeProps } from 'solid-js';

import { cn } from '~/utils/cn';

export interface IconProps {
  ref?: Ref<HTMLElement>;
  class?: string;
  variant?: 'regular' | 'fill' | 'bold';
  icon: string;
  label?: string;
  style?: string | JSX.CSSProperties;
}

export default function Icon(_props: IconProps) {
  const props = mergeProps(
    { variant: 'regular' } satisfies Partial<IconProps>,
    _props,
  );

  return (
    <i
      ref={props.ref}
      class={cn(
        props.variant === 'regular' ? 'ph' : `ph-${props.variant}`,
        `ph-${props.icon}`,
        props.class,
      )}
      aria-hidden={props.label ? undefined : true}
      aria-role={props.label ? 'img' : undefined}
      aria-label={props.label}
      style={props.style}
    />
  );
}
