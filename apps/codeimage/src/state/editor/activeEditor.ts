import {SUPPORTED_LANGUAGES} from '@codeimage/config';
import {useI18n} from '@codeimage/locale';
import {getRootEditorStore} from '@codeimage/store/editor';
import {getUiStore} from '@codeimage/store/ui';
import {toast} from '@codeimage/ui';
import {appEnvironment} from '@core/configuration';
import {clamp, isNonNullable} from '@solid-primitives/utils';
import {createEffect, createMemo, createRoot, createSignal, on} from 'solid-js';
import {
  applyColorToSelections,
  mapColoredRangesThroughChanges,
  mapColoredRangesThroughTextReplacement,
} from './coloredRanges';
import type {ColoredTextRange} from './model';
import {createPrettierFormatter} from '../../hooks/createPrettierFormatter';
import type {AppLocaleEntries} from '../../i18n';

const $activeEditorState = () => {
  return createRoot(() => {
    const languages = SUPPORTED_LANGUAGES;
    const {
      state,
      isActive,
      actions: {setEditors},
    } = getRootEditorStore();
    const currentEditor = () =>
      state.editors.find(editor => isActive(editor.id));

    const currentEditorIndex = () =>
      state.editors.findIndex(editor => editor.id === currentEditor()?.id);

    const [selectionRanges, setCurrentSelectionRanges] = createSignal<
      {from: number; to: number}[]
    >([]);

    const setSelectionRanges = (
      ranges: readonly {from: number; to: number}[],
    ) => setCurrentSelectionRanges(ranges.map(({from, to}) => ({from, to})));

    const hasSelection = () =>
      selectionRanges().some(range => range.to > range.from);

    const setColoredRanges = (ranges: ColoredTextRange[]) => {
      const index = currentEditorIndex();
      if (index < 0) return;
      setEditors(index, 'coloredRanges', ranges);
    };

    const applySyntaxCategoryToSelection = (category: string | null) => {
      const current = currentEditor();
      if (!current || !hasSelection()) return;
      setColoredRanges(
        applyColorToSelections(
          current.coloredRanges ?? [],
          selectionRanges(),
          category,
        ),
      );
    };

    const mapColoredRanges = (
      changes: readonly {
        mapPos(position: number, association?: number): number;
      }[],
    ) => {
      const current = currentEditor();
      if (!current || !(current.coloredRanges ?? []).length) return;
      setColoredRanges(
        mapColoredRangesThroughChanges(current.coloredRanges, changes),
      );
    };

    const setLanguageId = (languageId: string) => {
      const currentLanguageId = currentEditor()?.languageId;
      setEditors(currentEditorIndex(), 'languageId', languageId);
      if (currentLanguageId !== languageId) {
        const defaultFormatter = formatter.availableFormatters()[0]?.parser;
        setEditors(currentEditorIndex(), 'formatter', defaultFormatter ?? null);
      }
    };

    const setCode = (code: string) =>
      setEditors(currentEditorIndex(), 'code', code);

    const setLineNumberStart = (lineNumberStart: number | null | undefined) => {
      if (!lineNumberStart) {
        lineNumberStart = 1;
      }
      return setEditors(
        currentEditorIndex(),
        'lineNumberStart',
        // TODO Already done by @codeui/kit but I don't feel safe about this component I made
        clamp(
          lineNumberStart,
          appEnvironment.lineNumbers.min,
          appEnvironment.lineNumbers.max,
        ),
      );
    };

    const setFormatterName = (formatter: string | null) =>
      setEditors(currentEditorIndex(), 'formatter', formatter);

    const formatter = createPrettierFormatter(
      () => currentEditor()?.languageId ?? '',
      () => currentEditor()?.tab?.tabName ?? '',
      () => currentEditor()?.formatter ?? null,
    );

    // On each tab editor change, it will listen for name and languageId updates
    // in order to update the formatter with the default one.
    let unsubscribe: (() => void) | undefined = undefined;
    createEffect(() => {
      const editor = currentEditorIndex();
      setCurrentSelectionRanges([]);
      if (!!unsubscribe) unsubscribe();
      if (!isNonNullable(editor) || editor === -1) return;
      createRoot(dispose => {
        unsubscribe = dispose;
        const name = createMemo(() => currentEditor()?.tab?.tabName);
        const languageId = createMemo(() => currentEditor()?.languageId);
        createEffect(
          on([name, languageId], () => {
            const defaultFormatter = formatter.availableFormatters()[0];
            setEditors(
              currentEditorIndex(),
              'formatter',
              defaultFormatter?.parser ?? null,
            );
          }),
        );
      });
    });

    return {
      editor: currentEditor,
      setSelectionRanges,
      hasSelection,
      applySyntaxCategoryToSelection,
      mapColoredRanges,
      setLanguageId,
      setCode,
      setLineNumberStart,
      formatter,
      setFormatterName,
      canFormat: formatter.canFormat,
      format(code = currentEditor()?.code ?? '') {
        return new Promise(async r => {
          try {
            const result = await formatter.format(
              code,
              {
                singleAttributePerLine: true,
                trailingComma: 'none',
                arrowParens: 'always',
                bracketSpacing: true,
                proseWrap: 'always',
                printWidth: 90,
              },
              currentEditor()?.formatter ?? undefined,
            );

            const previousCode = currentEditor()?.code ?? '';
            if (result !== previousCode) {
              setColoredRanges(
                mapColoredRangesThroughTextReplacement(
                  currentEditor()?.coloredRanges ?? [],
                  previousCode,
                  result,
                ),
              );
              setCode(result);
              toast.success(
                () => {
                  const [t] = useI18n<AppLocaleEntries>();
                  return t('canvas.formattedCode');
                },
                {
                  position: 'bottom-center',
                  theme: getUiStore().invertedThemeMode(),
                },
              );
            }
            r(true);
          } catch (e) {
            console.warn(e);
            toast.error(
              () => {
                const [t] = useI18n<AppLocaleEntries>();
                return t('canvas.errorFormattedCode');
              },
              {
                position: 'bottom-center',
                theme: getUiStore().invertedThemeMode(),
              },
            );
            r(false);
          }
        });
      },
    };
  });
};

let state: ReturnType<typeof $activeEditorState>;

export function getActiveEditorStore() {
  if (!state) {
    state = $activeEditorState();
  }
  return state;
}
