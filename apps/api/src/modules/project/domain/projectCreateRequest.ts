import type {
  Project,
  SnippetEditorOptions,
  SnippetEditorTab,
  SnippetFrame,
  SnippetTerminal,
} from '@codeimage/prisma-models';

type IdAndProjectId = 'id' | 'projectId';

type EditorCreateRequest = Omit<
  SnippetEditorTab,
  IdAndProjectId | 'coloredRanges'
> & {
  coloredRanges: {from: number; to: number; color: string}[];
};

export interface ProjectCreateRequest {
  name: Project['name'];
  editorOptions: Omit<SnippetEditorOptions, IdAndProjectId>;
  terminal: Omit<SnippetTerminal, IdAndProjectId>;
  frame: Omit<SnippetFrame, IdAndProjectId>;
  editors: EditorCreateRequest[];
}

type ColoredEditorTab = Omit<SnippetEditorTab, 'coloredRanges'> & {
  coloredRanges: {from: number; to: number; color: string}[];
};

export type ProjectCreateResponse = Project & {
  editorOptions: SnippetEditorOptions;
  terminal: SnippetTerminal;
  frame: SnippetFrame;
  editorTabs: ColoredEditorTab[];
};
