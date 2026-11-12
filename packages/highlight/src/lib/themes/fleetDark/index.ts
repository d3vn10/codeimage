import {createTheme} from '../../core';
import {fleetDark, palette} from './fleetDark';

export const fleetDarkTheme = createTheme({
  id: 'fleetDark',
  editorTheme: fleetDark,
  properties: {
    darkMode: true,
    label: 'Fleet Dark',
    previewBackground: `linear-gradient(152deg, rgb(87% 61% 43%) 0%, rgb(49% 14% 95%) 100%)`,
    terminal: {
      main: palette.background,
      text: '#fff',
    },
    highlightColors: [
      {id: 'base', label: 'Text', color: '#d1d1d1'},
      {id: 'keywords', label: 'Keyword', color: palette.keyword},
      {id: 'strings', label: 'String', color: palette.string},
      {id: 'numbers', label: 'Number', color: palette.number},
      {id: 'comments', label: 'Comment', color: '#898989'},
      {id: 'function', label: 'Function', color: palette.number},
      {id: 'className', label: 'Class', color: '#87c3ff'},
      {id: 'typeName', label: 'Type', color: palette.keyword},
      {id: 'propertyName', label: 'Property', color: '#af9cff'},
      {id: 'variableName', label: 'Variable', color: '#d1d1d1'},
      {id: 'variableNameSpecial', label: 'Special variable', color: '#cc7c8a'},
      {id: 'boolean', label: 'Boolean', color: palette.boolean},
      {id: 'tag', label: 'Tag', color: '#87c3ff'},
      {id: 'regexp', label: 'Regular expression', color: palette.keyword},
      {id: 'punctuation', label: 'Punctuation', color: '#d1d1d1'},
      {id: 'delimiters', label: 'Delimiter', color: '#d1d1d1'},
      {id: 'operators', label: 'Operator', color: palette.keyword},
      {id: 'self', label: 'Self reference', color: '#cc7c8a'},
      {id: 'meta', label: 'Metadata', color: palette.metadata},
      {id: 'atom', label: 'Atom', color: palette.number},
    ],
  },
} as const);
