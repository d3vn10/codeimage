import type {CustomTheme} from '@codeimage/highlight';
import {THEME_REGISTRY} from '@codeimage/store/theme/themeRegistry';
import {buildCustomTheme, readCustomThemeDefinitions, writeCustomThemeDefinitions} from '@codeimage/store/theme/customTheme';
import type {CustomThemeDefinition} from '@codeimage/store/theme/customTheme';
import type {ResourceReturn} from 'solid-js';
import {
  createMemo,
  createResource,
  createRoot,
  createSignal,
  mapArray,
} from 'solid-js';

function $getThemeStore() {
  const [loaded, setLoaded] = createSignal(false, {equals: false});
  const [customThemeDefinitions, setCustomThemeDefinitions] = createSignal(readCustomThemeDefinitions());

  const themes = Object.fromEntries(
    Object.values(THEME_REGISTRY).map(
      theme => [theme.id, createResource(loaded, theme.load)] as const,
    ),
  );

  const [customThemeResources, setCustomThemeResources] = createSignal(
    customThemeDefinitions().map(definition => ({
      id: definition.id,
      resource: createResource(loaded, () => Promise.resolve(buildCustomTheme(definition))),
    })),
  );

  const themeArray = mapArray(
    () => [...Object.values(themes), ...customThemeResources().map(item => item.resource)],
    ([theme]) => theme,
  );

  const themeLoading = createMemo(() =>
    themeArray().some(theme => theme.loading),
  );

  const getThemeResource = (themeId: string): ResourceReturn<CustomTheme> =>
    themes[themeId] ??
    customThemeResources().find(item => item.id === themeId)?.resource ??
    themes[Object.keys(themes)[0]];

  const getThemeDef = (id: string) => {
    const registeredTheme = THEME_REGISTRY.find(theme => theme.id === id);
    if (registeredTheme) return registeredTheme;

    const customDefinition = customThemeDefinitions().find(theme => theme.id === id);
    if (!customDefinition) return undefined;

    return {
      id: customDefinition.id,
      load: () => Promise.resolve(buildCustomTheme(customDefinition)),
    };
  };

  const loadThemes = () => setLoaded(true);

  const addCustomTheme = (definition: CustomThemeDefinition) => {
    const next = [...customThemeDefinitions().filter(item => item.id !== definition.id), definition];
    setCustomThemeDefinitions(next);
    writeCustomThemeDefinitions(next);
    const resource = createResource(loaded, () => Promise.resolve(buildCustomTheme(definition)));
    setCustomThemeResources(items => [
      ...items.filter(item => item.id !== definition.id),
      {id: definition.id, resource},
    ]);
  };

  return {
    themeResources: themes,
    themeArray,
    themeLoading,
    getThemeDef,
    getThemeResource,
    customThemeDefinitions,
    addCustomTheme,
    loadThemes,
  } as const;
}

export const themeStore = createRoot($getThemeStore);

export function getThemeStore() {
  return themeStore;
}
