import type {Extension} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import type {ManualHighlightColor} from './custom-theme';
import type {StyledAutoCompleteOptions} from '../plugins/autocomplete-style';
import {styledAutocomplete} from '../plugins/autocomplete-style';
import type {StyledCursorOptions} from '../plugins/cursor-style';
import {styledCursor} from '../plugins/cursor-style';
import type {StyledHighlightOptions} from '../plugins/highlight-style';
import {styledHighlight} from '../plugins/highlight-style';
import type {StyledLineNumbersOptions} from '../plugins/line-numbers-style';
import {styledLineNumbers} from '../plugins/line-numbers-style';
import type {StyledSelectionOptions} from '../plugins/selection-style';
import {styledSelection} from '../plugins/selection-style';

export interface ThemeOptions {
  darkMode: boolean;
  selection?: Partial<StyledSelectionOptions>;
  cursor?: StyledCursorOptions;
  lineNumbers?: StyledLineNumbersOptions;
  autocomplete: StyledAutoCompleteOptions;
  highlight: StyledHighlightOptions;
}

const highlightColorRoles: readonly [keyof StyledHighlightOptions, string][] = [
  ['base', 'Text'],
  ['keywords', 'Keywords'],
  ['strings', 'Strings'],
  ['numbers', 'Numbers'],
  ['comments', 'Comments'],
  ['function', 'Functions'],
  ['className', 'Classes'],
  ['typeName', 'Types'],
  ['propertyName', 'Properties'],
  ['variableName', 'Variables'],
  ['variableNameSpecial', 'Special variables'],
  ['boolean', 'Booleans'],
  ['tag', 'Tags'],
  ['regexp', 'Regular expressions'],
  ['punctuation', 'Punctuation'],
  ['delimiters', 'Delimiters'],
  ['operators', 'Operators'],
  ['attrName', 'Attribute names'],
  ['attrValue', 'Attribute values'],
  ['self', 'Self references'],
  ['annotation', 'Annotations'],
  ['meta', 'Metadata'],
  ['paren', 'Parentheses'],
  ['brackets', 'Brackets'],
  ['atom', 'Atoms'],
];

const highlightColorPalettes = new WeakMap<object, readonly ManualHighlightColor[]>();

/** Returns the syntax color roles registered by a theme built with defineEditorTheme. */
export function getEditorThemeHighlightColors(extension: Extension): ManualHighlightColor[] {
  const colors = new Map<string, ManualHighlightColor>();
  const visit = (value: unknown): void => {
    if (!value || typeof value !== 'object') return;
    for (const color of highlightColorPalettes.get(value) ?? []) {
      if (!colors.has(color.id)) colors.set(color.id, color);
    }
    if (Array.isArray(value)) value.forEach(visit);
  };
  visit(extension);
  return [...colors.values()];
}

export const defineEditorTheme = (theme: ThemeOptions) => {
  const {darkMode, highlight, selection, autocomplete, cursor, lineNumbers} =
    theme;

  const base = EditorView.theme({
    '&': {
      color: highlight.base,
    },
    '.cm-content': {
      color: highlight.base,
    },
  });

  const extensions: Extension[] = [
    base,
    styledCursor({
      color: cursor?.color ?? (darkMode ? '#FFF' : '#000'),
    }),
    lineNumbers?.color
      ? styledLineNumbers({
          color: lineNumbers?.color ?? (darkMode ? '#FFF' : '#000'),
        })
      : [],
    styledSelection({
      backgroundColor: selection?.backgroundColor ?? `${highlight.keywords}50`,
      color: selection?.color ?? 'inherit',
    }),
    styledAutocomplete(autocomplete),
    styledHighlight(highlight),
  ];

  const palette = highlightColorRoles
    .map(([id, label]) => ({id, label, color: highlight[id]}))
    .filter(
      (item): item is ManualHighlightColor =>
        typeof item.color === 'string' && item.color.length > 0,
    );
  highlightColorPalettes.set(extensions, palette);

  return extensions;
};
