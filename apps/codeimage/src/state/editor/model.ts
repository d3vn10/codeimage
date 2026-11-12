import type {PersistedFrameState} from '@codeimage/store/frame/model';

export interface EditorUIOptions {
  fontId: string;
  fontWeight: number;
  showLineNumbers: boolean;
  focused: boolean;
  themeId: string;
}

export interface ColoredTextRange {
  from: number;
  to: number;
  /** Syntax category ID (for example, "function" or "comments"). */
  color: string;
}

export interface TabState {
  tabName: string | null;
  tabIcon?: string;
}

export interface EditorState {
  id: string;
  code: string;
  tab: TabState;
  formatter?: string | null;
  languageId: string;
  lineNumberStart: number;
  coloredRanges: ColoredTextRange[];
}

export interface EditorUIOptions {
  fontId: string;
  fontWeight: number;
  showLineNumbers: boolean;
  focused: boolean;
  themeId: string;
  enableLigatures: boolean;
  fontSize: number;
  lineHeight: number;
}

export interface PersistedEditorState {
  readonly options: Omit<EditorUIOptions, 'focused'>;
  readonly editors: {
    id: string;
    code: string;
    tabName: string;
    tabIcon?: string;
    languageId: string;
    lineNumberStart: number;
    coloredRanges: ColoredTextRange[];
  }[];
}

export interface TerminalState {
  showHeader: boolean;
  type: string;
  accentVisible: boolean;
  shadow: string | null;
  background: string;
  textColor: string;
  showWatermark: boolean;
  showGlassReflection: boolean;
  opacity: number;
  alternativeTheme: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  borderType: ('glass' | (string & {})) | null;
}

export type PersistedTerminalState = Pick<
  TerminalState,
  | 'showHeader'
  | 'type'
  | 'accentVisible'
  | 'shadow'
  | 'background'
  | 'textColor'
  | 'showWatermark'
  | 'showGlassReflection'
  | 'opacity'
  | 'alternativeTheme'
  | 'borderType'
>;

export interface ProjectEditorPersistedState {
  $snippetId: string | null;
  $version: string;
  frame: PersistedFrameState;
  terminal: PersistedTerminalState;
  editor: PersistedEditorState;
}
