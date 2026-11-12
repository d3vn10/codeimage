import {SUPPORTED_LANGUAGES} from '@codeimage/config';
import type {LanguageDefinition} from '@codeimage/config';
import {getEditorThemeHighlightColors} from '@codeimage/highlight';
import type {CustomTheme} from '@codeimage/highlight';
import {useI18n} from '@codeimage/locale';
import {getRootEditorStore} from '@codeimage/store/editor';
import {getActiveEditorStore} from '@codeimage/store/editor/activeEditor';
import {dispatchUpdateTheme} from '@codeimage/store/effects/onThemeChange';
import {getThemeStore} from '@codeimage/store/theme/theme.store';
import {Button, createSelectOptions, fieldStyles, NumberField, Select} from '@codeui/kit';
import {appEnvironment} from '@core/configuration';
import {getUmami} from '@core/constants/umami';
import {DynamicSizedContainer} from '@ui/DynamicSizedContainer/DynamicSizedContainer';
import {SegmentedField} from '@ui/SegmentedField/SegmentedField';
import {SkeletonLine} from '@ui/Skeleton/Skeleton';
import type {ParentComponent} from 'solid-js';
import {createEffect, createMemo, createSignal, Show} from 'solid-js';
import type {AppLocaleEntries} from '../../i18n';
import {FontPicker} from './controls/FontPicker/FontPicker';
import {PanelDivider} from './PanelDivider';
import {PanelHeader} from './PanelHeader';
import {PanelRow, TwoColumnPanelRow} from './PanelRow';
import {SuspenseEditorItem} from './SuspenseEditorItem';

const languages: readonly LanguageDefinition[] = [...SUPPORTED_LANGUAGES].sort(
  (a, b) => {
    if (a.featured && !b.featured) {
      return -1; // a comes first
    } else if (!a.featured && b.featured) {
      return 1; // b comes first
    } else if (a.featured && b.featured) {
      return SUPPORTED_LANGUAGES.indexOf(a) - SUPPORTED_LANGUAGES.indexOf(b); // sort by position
    } else {
      return a.label.localeCompare(b.label); // sort alphabetically
    }
  },
);

export const EditorStyleForm: ParentComponent = () => {
  const {themeArray} = getThemeStore();
  const [selectedManualCategory, setSelectedManualCategory] =
    createSignal('function');
  const {lineNumbers: lineNumbersConfig} = appEnvironment;
  const [t] = useI18n<AppLocaleEntries>();
  const {
    editor,
    setLanguageId,
    formatter,
    setFormatterName,
    setLineNumberStart,
    hasSelection,
    applySyntaxCategoryToSelection,
  } = getActiveEditorStore();
  const {
    state,
    actions: {
      setShowLineNumbers,
      setFontWeight,
      setFontId,
      setEnableLigatures,
      setFontSize,
      setLineHeight,
      setTabIcon,
    },
    computed: {selectedFont},
  } = getRootEditorStore();

  const languagesOptions = createSelectOptions(
    languages.map(language => ({
      label: language.label,
      value: language.id,
    })),
    {
      key: 'label',
      valueKey: 'value',
    },
  );

  const tabIconOptions = createSelectOptions(
    [
      {label: 'Automatic', value: ''},
      ...SUPPORTED_LANGUAGES.flatMap(language => language.icons)
        .filter(
          (icon, index, icons) =>
            icons.findIndex(item => item.extension === icon.extension) === index,
        )
        .map(icon => ({
          label: `${icon.name} (${icon.extension})`,
          value: icon.extension,
        })),
    ],
    {key: 'label', valueKey: 'value'},
  );

  const syntaxHighlightOptions = createSelectOptions(
    () =>
      themeArray()
        .map(theme => theme())
        .filter((theme): theme is CustomTheme => !!theme)
        .map(theme => {
          return {
            label: theme.properties.label,
            value: theme.id,
          };
        }),
    {key: 'label', valueKey: 'value'},
  );

  const manualHighlightCategories = createMemo(() => {
    const theme =
      themeArray().find(item => item()?.id === state.options.themeId)?.() ??
      themeArray()[0]?.();
    const themeCategories = theme
      ? [
          ...getEditorThemeHighlightColors(theme.editorTheme),
          ...(theme.properties.highlightColors ?? []),
        ]
      : [];
    const categoryLabels = [
      ['base', 'Text'],
      ['keywords', 'Keyword'],
      ['strings', 'String'],
      ['numbers', 'Number'],
      ['comments', 'Comment'],
      ['function', 'Function'],
      ['className', 'Class'],
      ['typeName', 'Type'],
      ['propertyName', 'Property'],
      ['variableName', 'Variable'],
      ['variableNameSpecial', 'Special variable'],
      ['boolean', 'Boolean'],
      ['tag', 'Tag'],
      ['regexp', 'Regular expression'],
      ['punctuation', 'Punctuation'],
      ['delimiters', 'Delimiter'],
      ['operators', 'Operator'],
      ['attrName', 'Attribute name'],
      ['attrValue', 'Attribute value'],
      ['self', 'Self reference'],
      ['annotation', 'Annotation'],
      ['meta', 'Metadata'],
      ['paren', 'Parenthesis'],
      ['brackets', 'Bracket'],
      ['atom', 'Atom'],
    ] as const;
    return categoryLabels.map(([id, label]) => ({
      id,
      label,
      color: themeCategories.find(category => category.id === id)?.color ?? '',
    }));
  });

  const manualHighlightCategoryOptions = createSelectOptions(
    () =>
      manualHighlightCategories().map(category => ({
        label: category.label,
        value: category.id,
      })),
    {key: 'label', valueKey: 'value'},
  );

  const [lineHeightInput, setLineHeightInput] = createSignal(
    String(state.options.lineHeight ?? 1.5),
  );

  createEffect(() => {
    setLineHeightInput(String(state.options.lineHeight ?? 1.5));
  });

  const activeManualCategory = createMemo(() => selectedManualCategory());
  const isPlainText = createMemo(() => editor()?.languageId === 'plain-text');

  const languageFormatterOptions = createSelectOptions(
    () =>
      formatter.availableFormatters().map(prettierPlugin => {
        return {
          label: prettierPlugin.name,
          value: prettierPlugin.parser,
        };
      }),
    {key: 'label', valueKey: 'value'},
  );

  const fontWeightByFont = () => {
    const font = selectedFont();
    if (!font) {
      return [];
    }
    return font.types.map(type => ({
      label: type.name,
      value: type.weight,
    }));
  };

  const fontWeightOptions = createSelectOptions(fontWeightByFont, {
    key: 'label',
    valueKey: 'value',
  });

  return (
    <Show when={editor()}>
      {editor => (
        <>
          <DynamicSizedContainer>
            <PanelHeader label={t('frame.editor')} />

            <PanelRow for={'frameLanguageField'} label={t('frame.language')}>
              <TwoColumnPanelRow>
                <SuspenseEditorItem
                  fallback={<SkeletonLine width={'100%'} height={'26px'} />}
                >
                  {/* @ts-expect-error Fix @codeui/kit types */}
                  <Select
                    {...languagesOptions.props()}
                    {...languagesOptions.controlled(
                      () => editor().languageId,
                      language => {
                        setLanguageId(language!);
                        getUmami().track('change-language', {
                          language: language!,
                        });
                      },
                    )}
                    options={languagesOptions.options()}
                    aria-label={'Language'}
                    id={'frameLanguageField'}
                    size={'xs'}
                  />
                </SuspenseEditorItem>
              </TwoColumnPanelRow>
            </PanelRow>

            <PanelRow for={'frameTabIconField'} label={'Tab icon'}>
              <TwoColumnPanelRow>
                {/* @ts-expect-error Fix @codeui/kit types */}
                <Select
                  {...tabIconOptions.props()}
                  {...tabIconOptions.controlled(
                    () => editor().tab.tabIcon ?? '',
                    icon => setTabIcon(editor().id, icon ? (icon as string) : undefined),
                  )}
                  options={tabIconOptions.options()}
                  aria-label={'Tab icon'}
                  id={'frameTabIconField'}
                  size={'xs'}
                />
              </TwoColumnPanelRow>
            </PanelRow>

            <Show
              when={manualHighlightCategories().length > 0}
              fallback={
                <PanelRow
                  for={'manualSyntaxCategoryUnavailable'}
                  label={'Manual syntax coloring'}
                >
                  <TwoColumnPanelRow>
                    <span>Select Plain Text to enable manual syntax coloring.</span>
                  </TwoColumnPanelRow>
                </PanelRow>
              }
            >
              <>
                <PanelRow
                  for={'manualSyntaxCategoryField'}
                  label={'Syntax category'}
                >
                  <TwoColumnPanelRow>
                    <SuspenseEditorItem
                      fallback={<SkeletonLine width={'100%'} height={'26px'} />}
                    >
                      {/* @ts-expect-error Fix @codeui/kit types */}
                      <Select
                        {...manualHighlightCategoryOptions.props()}
                        {...manualHighlightCategoryOptions.controlled(
                          () => activeManualCategory(),
                          category =>
                            setSelectedManualCategory(category as string),
                        )}
                        options={manualHighlightCategoryOptions.options()}
                        itemLabel={option => {
                          const item = option as {label: string; value: string};
                          const color = manualHighlightCategories().find(
                            category => category.id === item.value,
                          )?.color;
                          return (
                            <span style={{color: color || 'inherit'}}>
                              {item.label}
                            </span>
                          );
                        }}
                        aria-label={'Syntax category'}
                        id={'manualSyntaxCategoryField'}
                        size={'xs'}
                        disabled={!isPlainText()}
                      />
                    </SuspenseEditorItem>
                  </TwoColumnPanelRow>
                </PanelRow>

                <PanelRow
                  for={'manualSyntaxApplyButton'}
                  label={'Selection'}
                >
                  <TwoColumnPanelRow>
                    <Button
                      id={'manualSyntaxApplyButton'}
                      size={'xs'}
                      theme={'secondary'}
                      block
                      disabled={!isPlainText() || !hasSelection()}
                      onClick={() =>
                        applySyntaxCategoryToSelection(activeManualCategory())
                      }
                    >
                      Apply category
                    </Button>
                  </TwoColumnPanelRow>
                </PanelRow>

                <PanelRow
                  for={'manualSyntaxClearButton'}
                  label={'Override'}
                >
                  <TwoColumnPanelRow>
                    <Button
                      id={'manualSyntaxClearButton'}
                      size={'xs'}
                      theme={'secondary'}
                      block
                      disabled={!isPlainText() || !hasSelection()}
                      onClick={() => applySyntaxCategoryToSelection(null)}
                    >
                      Clear category
                    </Button>
                  </TwoColumnPanelRow>
                </PanelRow>
              </>
            </Show>

            <PanelRow for={'frameLanguageField'} label={t('frame.theme')}>
              <TwoColumnPanelRow>
                <SuspenseEditorItem
                  fallback={<SkeletonLine width={'100%'} height={'26px'} />}
                >
                  {/* @ts-expect-error Fix @codeui/kit types */}
                  <Select
                    {...syntaxHighlightOptions.props()}
                    {...syntaxHighlightOptions.controlled(
                      () => state.options.themeId,
                      theme => {
                        theme = theme as string;
                        dispatchUpdateTheme({
                          updateBackground: false,
                          theme,
                        });
                      },
                    )}
                    options={syntaxHighlightOptions.options()}
                    aria-label={'Syntax highlight'}
                    id={'frameSyntaxHighlightField'}
                    size={'xs'}
                  />
                </SuspenseEditorItem>
              </TwoColumnPanelRow>
            </PanelRow>

            <Show
              when={formatter.availableFormatters().length > 0}
              keyed={true}
            >
              {_ => (
                <PanelRow
                  for={'editorLanguageFormatterField'}
                  label={t('frame.formatter')}
                >
                  <TwoColumnPanelRow>
                    <SuspenseEditorItem
                      fallback={<SkeletonLine width={'100%'} height={'26px'} />}
                    >
                      {/* @ts-expect-error Fix @codeui/kit types */}
                      <Select
                        {...languageFormatterOptions.props()}
                        {...languageFormatterOptions.controlled(
                          () =>
                            editor()?.formatter ??
                            formatter.availableFormatters()[0]?.parser,
                          formatter => {
                            formatter = formatter as string;
                            setFormatterName(formatter);
                          },
                        )}
                        disabled={formatter.availableFormatters().length === 1}
                        options={languageFormatterOptions.options()}
                        aria-label={'Editor language formatter'}
                        id={'editorLanguageFormatterField'}
                        size={'xs'}
                      />
                    </SuspenseEditorItem>
                  </TwoColumnPanelRow>
                </PanelRow>
              )}
            </Show>

            <PanelRow
              for={'frameLineNumbersField'}
              label={t('frame.lineNumbers')}
            >
              <TwoColumnPanelRow>
                <SuspenseEditorItem
                  fallback={<SkeletonLine width={'100%'} height={'26px'} />}
                >
                  <SegmentedField
                    size={'xs'}
                    adapt
                    id={'frameLineNumbersField'}
                    value={state.options.showLineNumbers}
                    onChange={setShowLineNumbers}
                    items={[
                      {label: t('common.show'), value: true},
                      {label: t('common.hide'), value: false},
                    ]}
                  />
                </SuspenseEditorItem>
              </TwoColumnPanelRow>
            </PanelRow>

            <Show when={state.options.showLineNumbers}>
              <PanelRow
                for={'frameLineNumberStartField'}
                label={t('frame.lineNumberStart')}
              >
                <TwoColumnPanelRow>
                  <SuspenseEditorItem
                    fallback={<SkeletonLine width={'100%'} height={'26px'} />}
                  >
                    <NumberField
                      size={'xs'}
                      min={lineNumbersConfig.min}
                      max={lineNumbersConfig.max}
                      id={'frameLineNumberStartField'}
                      value={editor().lineNumberStart}
                      ref={el => {
                        // TODO why called two times?
                        if (el) {
                          el.autocomplete = 'off';
                        }
                      }}
                      onChange={setLineNumberStart}
                    />
                  </SuspenseEditorItem>
                </TwoColumnPanelRow>
              </PanelRow>
            </Show>
          </DynamicSizedContainer>

          <PanelDivider />

          <DynamicSizedContainer>
            <PanelHeader label={t('frame.font')} />

            <PanelRow
              for={'fontPicker'}
              label={t('frame.font')}
              feature={'fontPicker'}
            >
              <TwoColumnPanelRow>
                <SuspenseEditorItem
                  fallback={<SkeletonLine width={'100%'} height={'26px'} />}
                >
                  <FontPicker
                    value={selectedFont()?.id}
                    onChange={fontId => setFontId(fontId)}
                  />
                </SuspenseEditorItem>
              </TwoColumnPanelRow>
            </PanelRow>

            <PanelRow
              for={'frameFontWeightField'}
              label={t('frame.fontWeight')}
            >
              <TwoColumnPanelRow>
                <SuspenseEditorItem
                  fallback={<SkeletonLine width={'85%'} height={'26px'} />}
                >
                  {/* @ts-expect-error Fix @codeui/kit types */}
                  <Select
                    {...fontWeightOptions.props()}
                    {...fontWeightOptions.controlled(
                      () => state.options.fontWeight,
                      value => setFontWeight(value ?? 400),
                    )}
                    aria-label={'Font weight'}
                    id={'frameFontWeightField'}
                    options={fontWeightOptions.options()}
                    size={'xs'}
                  />
                </SuspenseEditorItem>
              </TwoColumnPanelRow>
            </PanelRow>

            <PanelRow for={'frameFontSizeField'} label={'Font size'}>
              <TwoColumnPanelRow>
                <NumberField
                  size={'xs'}
                  id={'frameFontSizeField'}
                  min={8}
                  max={48}
                  step={1}
                  value={state.options.fontSize ?? 14}
                  onChange={value => setFontSize(value)}
                />
              </TwoColumnPanelRow>
            </PanelRow>

            <PanelRow for={'frameLineHeightField'} label={'Line spacing'}>
              <TwoColumnPanelRow>
                <input
                  id={'frameLineHeightField'}
                  aria-label={'Line spacing'}
                  class={fieldStyles.baseFieldVariants({size: 'xs'})}
                  type={'number'}
                  lang={'en'}
                  inputMode={'decimal'}
                  min={1}
                  max={1.5}
                  step={0.1}
                  value={lineHeightInput()}
                  style={{'padding-left': '12px', 'padding-right': '12px'}}
                  onInput={event => {
                    const rawValue = event.currentTarget.value;
                    setLineHeightInput(rawValue);
                    if (!rawValue || rawValue.endsWith('.')) return;
                    const value = Number(rawValue);
                    if (Number.isFinite(value) && value >= 1 && value <= 1.5) {
                      setLineHeight(value);
                    }
                  }}
                  onBlur={event => {
                    const rawValue = event.currentTarget.value;
                    const parsedValue = Number(rawValue);
                    const value =
                      rawValue && Number.isFinite(parsedValue)
                        ? Math.round(
                            Math.min(1.5, Math.max(1, parsedValue)) * 10,
                          ) / 10
                        : (state.options.lineHeight ?? 1.5);
                    setLineHeight(value);
                    setLineHeightInput(value.toFixed(1));
                  }}
                />
              </TwoColumnPanelRow>
            </PanelRow>

            <PanelRow for={'frameFontWeightField'} label={t('frame.ligatures')}>
              <TwoColumnPanelRow>
                <SuspenseEditorItem
                  fallback={<SkeletonLine width={'85%'} height={'26px'} />}
                >
                  <SegmentedField
                    adapt
                    size={'xs'}
                    id={'frameLigaturesField'}
                    value={state.options.enableLigatures}
                    onChange={setEnableLigatures}
                    items={[
                      {label: t('common.yes'), value: true},
                      {label: t('common.no'), value: false},
                    ]}
                  />
                </SuspenseEditorItem>
              </TwoColumnPanelRow>
            </PanelRow>
          </DynamicSizedContainer>
        </>
      )}
    </Show>
  );
};
