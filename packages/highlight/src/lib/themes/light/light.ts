import {defaultHighlightStyle, syntaxHighlighting} from '@codemirror/language';
import {createTheme} from '../../core';

export const lightTheme = createTheme({
  id: 'oneLight',
  editorTheme: [syntaxHighlighting(defaultHighlightStyle, {fallback: true})],
  properties: {
    darkMode: false,
    label: 'One light',
    previewBackground: 'linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%)',
    terminal: {
      main: '#ffffff',
      text: '#000000',
      tabs: {
        inactiveTabBackground: '#e5e5e5',
      },
    },
    highlightColors: [
      {id: 'keywords', label: 'Keywords', color: '#708'},
      {id: 'strings', label: 'Strings', color: '#a11'},
      {id: 'numbers', label: 'Numbers', color: '#164'},
      {id: 'comments', label: 'Comments', color: '#a50'},
      {id: 'function', label: 'Functions', color: '#00f'},
      {id: 'className', label: 'Classes', color: '#085'},
      {id: 'typeName', label: 'Types', color: '#085'},
      {id: 'propertyName', label: 'Properties', color: '#30a'},
      {id: 'boolean', label: 'Booleans', color: '#219'},
      {id: 'tag', label: 'Tags', color: '#170'},
      {id: 'regexp', label: 'Regular expressions', color: '#a11'},
      {id: 'punctuation', label: 'Punctuation', color: '#555'},
    ],
  },
});
