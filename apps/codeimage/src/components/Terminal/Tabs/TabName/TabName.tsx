import {createResizeObserver} from '@solid-primitives/resize-observer';
import type {JSXElement} from 'solid-js';
import {createEffect, createSignal} from 'solid-js';
import * as styles from './TabName.css';

interface TabNameProps {
  readonly: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
}

export default function TabName(props: TabNameProps): JSXElement {
  let hiddenTextEl!: HTMLDivElement;
  const [width, setWidth] = createSignal(0);
  const gap = 8;
  const placeholder = 'Untitled';

  const inputStyle = () => ({
    width: `${Math.max(width(), 16) + gap}px`,
  });

  createEffect(() => {
    setWidth(hiddenTextEl.clientWidth);
    createResizeObserver(
      () => hiddenTextEl,
      ({width}) => setWidth(width),
      {box: 'content-box'},
    );
  });

  const hiddenText = () => props.value || placeholder;

  return (
    <div class={styles.control}>
      <input
        aria-label="Tab name"
        value={props.value ?? ''}
        placeholder={placeholder}
        readOnly={props.readonly}
        class={styles.input}
        style={inputStyle()}
        onInput={event => props.onValueChange?.(event.currentTarget.value)}
      />
      <div ref={hiddenTextEl} class={styles.inlineHiddenItem}>
        {hiddenText()}
      </div>
    </div>
  );
}
