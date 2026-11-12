import {Button} from '@codeui/kit';
import {createSignal, For, Show} from 'solid-js';
import {getThemeStore} from '@codeimage/store/theme/theme.store';
import type {CustomThemeDefinition} from '@codeimage/store/theme/customTheme';

const colorFields: {key: keyof CustomThemeDefinition['colors']; label: string}[] = [
  {key: 'background', label: 'Editor background'},
  {key: 'foreground', label: 'Text'},
  {key: 'keyword', label: 'Keywords'},
  {key: 'string', label: 'Strings'},
  {key: 'number', label: 'Numbers'},
  {key: 'comment', label: 'Comments'},
  {key: 'function', label: 'Functions'},
  {key: 'type', label: 'Types and classes'},
  {key: 'property', label: 'Properties'},
  {key: 'variable', label: 'Variables'},
];

const defaultColors: CustomThemeDefinition['colors'] = {
  background: '#1e1e2e',
  foreground: '#cdd6f4',
  keyword: '#cba6f7',
  string: '#a6e3a1',
  number: '#fab387',
  comment: '#6c7086',
  function: '#89b4fa',
  type: '#f9e2af',
  property: '#94e2d5',
  variable: '#cdd6f4',
};

export function CustomThemeCreator() {
  const [open, setOpen] = createSignal(false);
  const [name, setName] = createSignal('My theme');
  const [darkMode, setDarkMode] = createSignal(true);
  const [colors, setColors] = createSignal({...defaultColors});
  const {addCustomTheme} = getThemeStore();

  function save() {
    const label = name().trim();
    if (!label) return;
    const id = `custom-${Date.now().toString(36)}`;
    addCustomTheme({
      id,
      label,
      darkMode: darkMode(),
      colors: {...colors()},
    });
    setOpen(false);
  }

  return (
    <>
      <Button size={'xs'} theme={'secondary'} block onClick={() => setOpen(true)}>
        Create custom theme
      </Button>
      <Show when={open()}>
        <div
          role="presentation"
          style={{
            position: 'fixed',
            inset: '0',
            'z-index': '1000',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            padding: '24px',
            background: 'rgba(0,0,0,.6)',
          }}
          onClick={event => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-theme-title"
            style={{
              width: 'min(560px, 100%)',
              'max-height': '85vh',
              overflow: 'auto',
              padding: '24px',
              'border-radius': '12px',
              background: 'var(--cui-panel-background, #202027)',
              color: 'var(--cui-panel-text, #fff)',
              'box-shadow': '0 18px 60px rgba(0,0,0,.4)',
            }}
          >
            <h2 id="custom-theme-title" style={{'font-size': '18px', 'margin-top': '0'}}>
              Create custom theme
            </h2>
            <label style={{display: 'grid', gap: '6px', 'margin-bottom': '16px'}}>
              Theme name
              <input
                value={name()}
                onInput={event => setName(event.currentTarget.value)}
                maxlength={40}
                style={{padding: '8px', 'border-radius': '6px', border: '1px solid #777', background: 'transparent', color: 'inherit'}}
              />
            </label>
            <label style={{display: 'flex', gap: '8px', 'align-items': 'center', 'margin-bottom': '18px'}}>
              <input type="checkbox" checked={darkMode()} onChange={event => setDarkMode(event.currentTarget.checked)} />
              Dark theme
            </label>
            <div style={{display: 'grid', 'grid-template-columns': 'repeat(2, minmax(0, 1fr))', gap: '12px 18px'}}>
              <For each={colorFields}>
                {field => (
                  <label style={{display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', gap: '8px', 'font-size': '13px'}}>
                    {field.label}
                    <input
                      type="color"
                      value={colors()[field.key]}
                      aria-label={field.label}
                      onInput={event => {
                        const value = event.currentTarget.value;
                        setColors(current => ({...current, [field.key]: value}));
                      }}
                      style={{width: '42px', height: '30px', padding: '0', border: '0', background: 'transparent', cursor: 'pointer'}}
                    />
                  </label>
                )}
              </For>
            </div>
            <div style={{display: 'flex', 'justify-content': 'flex-end', gap: '8px', 'margin-top': '24px'}}>
              <Button size={'sm'} theme={'secondary'} onClick={() => setOpen(false)}>Cancel</Button>
              <Button size={'sm'} theme={'primary'} disabled={!name().trim()} onClick={save}>Save theme</Button>
            </div>
          </section>
        </div>
      </Show>
    </>
  );
}
