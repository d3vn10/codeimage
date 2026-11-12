import {getEditorStore} from '@codeimage/store/editor';
import type {ProjectEditorPersistedState} from '@codeimage/store/editor/model';
import {DropdownMenuItem} from '@codeui/kit';
import {appEnvironment} from '@core/configuration';

function isProjectFile(value: unknown): value is ProjectEditorPersistedState {
  if (!value || typeof value !== 'object') return false;
  const project = value as Partial<ProjectEditorPersistedState>;
  return (
    typeof project.$version === 'string' &&
    !!project.editor &&
    Array.isArray(project.editor.editors) &&
    project.editor.editors.length > 0 &&
    !!project.frame &&
    !!project.terminal
  );
}

export function LocalProjectMenuItems() {
  let fileInput!: HTMLInputElement;

  function saveProject() {
    const store = getEditorStore();
    const project: ProjectEditorPersistedState = {
      $snippetId: null,
      $version: appEnvironment.version,
      frame: store.frame.stateToPersist(),
      terminal: store.terminal.stateToPersist(),
      editor: store.editor.stateToPersist(),
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const tabName =
      project.editor.editors[0]?.tabName?.replace(/\\.[^.]+$/, '') ||
      'untitled';
    const safeName = tabName.replace(/[<>:"/\\\\|?*]/g, '_');
    link.download = `${safeName}.codeimage`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function openProject(file?: File) {
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isProjectFile(parsed)) {
        throw new Error('Invalid CodeImage project file');
      }
      const store = getEditorStore();
      store.editor.actions.setFromPersistedState(parsed.editor);
      store.frame.setFromPersistedState(parsed.frame);
      store.terminal.setFromPersistedState(parsed.terminal);
    } catch (error) {
      console.error('Unable to open CodeImage project', error);
      window.alert(
        'This file is not a valid CodeImage project or could not be opened.',
      );
    } finally {
      fileInput.value = '';
    }
  }

  return (
    <>
      <DropdownMenuItem onClick={saveProject}>Save project</DropdownMenuItem>
      <DropdownMenuItem onClick={() => fileInput.click()}>
        Open project
      </DropdownMenuItem>
      <input
        ref={fileInput}
        type="file"
        accept=".codeimage,application/json"
        hidden
        onChange={event => void openProject(event.currentTarget.files?.[0])}
      />
    </>
  );
}
