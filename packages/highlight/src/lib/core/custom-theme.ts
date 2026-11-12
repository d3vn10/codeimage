import type {Extension} from '@codemirror/state';

/** Color associated with a syntax category in a CodeImage editor theme. */
export interface ManualHighlightColor {
  id: string;
  label: string;
  color: string;
}

export interface TerminalTabsTheme {
  background?: string;
  activeTabBackground?: string;
  inactiveTabBackground?: string;
  textColor?: string;
}

export interface TerminalThemeProperties {
  /**
   * @description Main background color of terminal
   */
  main: string;
  /**
   * description Base text color of terminal frame
   */
  text: string;
  /**
   *
   */
  tabs?: TerminalTabsTheme;
}

export interface CustomThemeProperties {
  /**
   * @description Label of theme box preview
   */
  label: string;
  /**
   * @description Background of theme box preview
   */
  previewBackground: string;
  /**
   * @description Enable/disable dark mode theme
   */
  darkMode: boolean;
  /**
   * @description MacOsTerminal theme properties
   */
  terminal: TerminalThemeProperties;
  /**
   * Optional syntax-category colors for themes without semantic highlight
   * styles.
   */
  highlightColors?: readonly ManualHighlightColor[];
}

export interface CustomTheme {
  /**
   * Custom theme identifier
   */
  id: string;
  /**
   * Custom theme editor base theme extension
   */
  editorTheme: Extension;
  /**
   * Custom theme properties
   */
  properties: CustomThemeProperties;
}
