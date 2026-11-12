import {getEditorStore} from '@codeimage/store/editor';
import type {ProjectEditorPersistedState} from '@codeimage/store/editor/model';
import {appEnvironment} from '@core/configuration';
import {createSignal} from 'solid-js';

function isProjectFile(value: unknown): value is ProjectEditorPersistedState {
  if (!value || typeof value !== 'object') return false;
  const project = value as Partial<ProjectEditorPersistedState>;
  return (
    typeof project.$version === 'string' &&
    !!project.editor &&
    Array.isArray(project.editor.editors) &&
    !!project.frame &&
    !!project.terminal
  );
}

export function LocalProjectMenuItems() {
  const [fileInput, setFileInput] = createSignal<HTMLInputElement>();

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
    link.download = 'untitled.codeimage';
    link.click();
    URL.revokeObjectURL(url);
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
      if (fileInput()) fileInput()!.value = '';
    }
  }

  return (
    <>
      <input
        ref={setFileInput}
        type="file"
        accept=".codeimage,application/json"
        hidden
        onChange={event => void openProject(event.currentTarget.files?.[0])}
      />
      <button
        type="button"
        onClick={() => fileInput()?.click()}
        style={{display: 'none'}}
        aria-hidden="true"
      />
    </>
  );
}
