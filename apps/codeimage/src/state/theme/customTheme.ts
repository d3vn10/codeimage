import {HighlightStyle, syntaxHighlighting} from '@codemirror/language';
import type {Extension} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import {tags as t} from '@lezer/highlight';
import type {CustomTheme} from '@codeimage/highlight';
import {createTheme} from '@codeimage/highlight';

export interface CustomThemeDefinition {
  id: string;
  label: string;
  darkMode: boolean;
  colors: {
    background: string;
    foreground: string;
    keyword: string;
    string: string;
    number: string;
    comment: string;
    function: string;
    type: string;
    property: string;
    variable: string;
  };
}

export const CATPPUCCIN_MOCHA: CustomThemeDefinition = {
  id: 'catppuccin-mocha',
  label: 'Catppuccin Mocha',
  darkMode: true,
  colors: {
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
  },
};

export const CATPPUCCIN_LATTE: CustomThemeDefinition = {
  id: 'catppuccin-latte',
  label: 'Catppuccin Latte',
  darkMode: false,
  colors: {
    background: '#eff1f5',
    foreground: '#4c4f69',
    keyword: '#8839ef',
    string: '#40a02b',
    number: '#fe640b',
    comment: '#9ca0b0',
    function: '#1e66f5',
    type: '#df8e1d',
    property: '#179299',
    variable: '#4c4f69',
  },
};

export const DEFAULT_CUSTOM_THEMES = [CATPPUCCIN_LATTE, CATPPUCCIN_MOCHA] as const;

const STORAGE_KEY = 'codeimage.customThemes.v1';

export function readCustomThemeDefinitions(): CustomThemeDefinition[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [...DEFAULT_CUSTOM_THEMES];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [...DEFAULT_CUSTOM_THEMES];
    return parsed.filter(
      (item): item is CustomThemeDefinition =>
        !!item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.label === 'string' &&
        typeof item.darkMode === 'boolean' &&
        !!item.colors &&
        typeof item.colors.background === 'string' &&
        typeof item.colors.foreground === 'string',
    );
  } catch {
    return [...DEFAULT_CUSTOM_THEMES];
  }
}

export function writeCustomThemeDefinitions(definitions: CustomThemeDefinition[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(definitions));
}

const colorRoles = [
  ['base', 'Text', 'foreground'],
  ['keywords', 'Keyword', 'keyword'],
  ['strings', 'String', 'string'],
  ['numbers', 'Number', 'number'],
  ['comments', 'Comment', 'comment'],
  ['function', 'Function', 'function'],
  ['className', 'Class', 'type'],
  ['typeName', 'Type', 'type'],
  ['propertyName', 'Property', 'property'],
  ['variableName', 'Variable', 'variable'],
  ['variableNameSpecial', 'Special variable', 'variable'],
  ['boolean', 'Boolean', 'number'],
  ['tag', 'Tag', 'keyword'],
  ['regexp', 'Regular expression', 'string'],
  ['punctuation', 'Punctuation', 'foreground'],
  ['delimiters', 'Delimiter', 'foreground'],
  ['operators', 'Operator', 'keyword'],
  ['self', 'Self reference', 'keyword'],
  ['meta', 'Metadata', 'comment'],
  ['atom', 'Atom', 'number'],
] as const;

export function buildCustomTheme(definition: CustomThemeDefinition): CustomTheme {
  const {colors} = definition;
  const highlight = HighlightStyle.define([
    {tag: [t.comment, t.lineComment, t.blockComment], color: colors.comment},
    {tag: [t.keyword, t.modifier, t.operatorKeyword], color: colors.keyword},
    {tag: [t.string, t.special(t.string)], color: colors.string},
    {tag: [t.number, t.bool, t.null], color: colors.number},
    {tag: [t.function(t.variableName), t.function(t.propertyName)], color: colors.function},
    {tag: [t.className, t.typeName], color: colors.type},
    {tag: [t.propertyName], color: colors.property},
    {tag: [t.variableName, t.definition(t.variableName)], color: colors.variable},
  ]);

  const editorTheme: Extension = [
    EditorView.theme({
      '&': {
        color: colors.foreground,
        backgroundColor: colors.background,
      },
      '.cm-content': {color: colors.foreground},
      '.cm-gutters': {backgroundColor: 'transparent', color: colors.comment, border: 'none'},
      '.cm-lineNumbers .cm-gutterElement': {color: colors.comment},
      '.cm-activeLine': {backgroundColor: definition.darkMode ? '#ffffff10' : '#00000008'},
      '.cm-selectionBackground': {backgroundColor: definition.darkMode ? '#585b70' : '#bcc0cc'},
      '&.cm-focused .cm-cursor': {borderLeftColor: colors.foreground},
    }, {dark: definition.darkMode}),
    syntaxHighlighting(highlight),
  ];

  return createTheme({
    id: definition.id,
    editorTheme,
    properties: {
      darkMode: definition.darkMode,
      label: definition.label,
      previewBackground: colors.background,
      terminal: {
        main: colors.background,
        text: colors.foreground,
      },
      highlightColors: colorRoles.map(([id, label, key]) => ({
        id,
        label,
        color: colors[key],
      })),
    },
  });
}
