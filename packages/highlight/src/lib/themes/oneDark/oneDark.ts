import {createTheme} from '../../core';
import {oneDark} from '@codemirror/theme-one-dark';

export const oneDarkTheme = createTheme({
  id: 'oneDark',
  editorTheme: oneDark,
  properties: {
    darkMode: true,
    label: 'One dark',
    previewBackground: '#814CE2',
    terminal: {
      main: '#282c34',
      text: '#e5c07b',
    },
    highlightColors: [
      {id: 'keywords', label: 'Keywords', color: '#c678dd'},
      {id: 'strings', label: 'Strings', color: '#98c379'},
      {id: 'numbers', label: 'Numbers', color: '#d19a66'},
      {id: 'comments', label: 'Comments', color: '#5c6370'},
      {id: 'function', label: 'Functions', color: '#61afef'},
      {id: 'className', label: 'Classes', color: '#e5c07b'},
      {id: 'typeName', label: 'Types', color: '#e5c07b'},
      {id: 'propertyName', label: 'Properties', color: '#d19a66'},
      {id: 'boolean', label: 'Booleans', color: '#d19a66'},
      {id: 'tag', label: 'Tags', color: '#e06c75'},
      {id: 'regexp', label: 'Regular expressions', color: '#56b6c2'},
      {id: 'punctuation', label: 'Punctuation', color: '#abb2bf'},
    ],
  },
} as const);
