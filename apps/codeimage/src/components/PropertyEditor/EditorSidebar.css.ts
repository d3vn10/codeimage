import {fontSize, themeVars} from '@codeimage/ui';
import {createTheme, style} from '@vanilla-extract/css';
import {recipe} from '@vanilla-extract/recipes';

export const [sidebarTheme, sidebarVars] = createTheme({
  gap: themeVars.spacing['4'],
  panelTitleTextColor: themeVars.dynamicColors.panel.textColor,
  panelRowsTextColor: themeVars.dynamicColors.panel.textColorAlt,
});

export const sidebar = style([
  sidebarTheme,
  {
    paddingLeft: sidebarVars.gap,
    paddingBottom: themeVars.spacing['8'],
    boxSizing: 'border-box',
  },
]);

export const panelHeader = style([
  {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: '48px',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    flexShrink: 0,
    width: '100%',
    color: sidebarVars.panelTitleTextColor,
  },
]);

export const panelRow = style([
  {
    position: 'relative',
    display: 'grid',
    width: '100%',
    paddingTop: themeVars.spacing['1'],
    paddingBottom: themeVars.spacing['1'],
    columnGap: themeVars.spacing['2'],
    gridTemplateColumns: 'minmax(0,1.25fr) repeat(2,minmax(0,1fr))',
    gridTemplateRows: 'auto',
    color: sidebarVars.panelTitleTextColor,
  },
]);

export const panelRowContent = recipe({
  base: {
    display: 'flex',
    width: '100%',
    height: '100%',
    flex: '1 0 0',
    vars: {
      [fontSize]: themeVars.fontSize.xs,
    },
  },
  variants: {
    twoColumn: {
      true: {
        gridColumn: '2 / -1',
      },
    },
    threeColumn: {
      true: {
        gridColumn: '1 / -1',
        paddingLeft: themeVars.spacing['3'],
      },
    },
  },
});

export const titleWrapper = style([
  {
    selectors: {
      [`${panelRow} &`]: {
        color: sidebarVars.panelRowsTextColor,
        height: '30px',
        display: 'inline-flex',
        position: 'relative',
        paddingLeft: '15px',
        alignItems: 'center',
        userSelect: 'none',
        hyphens: 'auto', // ???
        wordBreak: 'break-word',
      },
    },
  },
]);

export const panelDivider = style({
  borderBottom: `1px solid ${themeVars.dynamicColors.divider}`,
  paddingTop: themeVars.spacing['4'],
});

export const highlightPalette = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: themeVars.spacing['2'],
  gridColumn: '2 / -1',
  minHeight: '30px',
});

export const highlightColorButton = style({
  appearance: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  padding: '3px',
  borderRadius: '4px',
  border: `1px solid ${themeVars.dynamicColors.divider}`,
  background: 'transparent',
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      opacity: 0.35,
      cursor: 'not-allowed',
    },
    '&:not(:disabled):hover': {
      outline: '1px solid currentColor',
    },
    '&:focus-visible': {
      outline: '2px solid currentColor',
      outlineOffset: '2px',
    },
  },
});

export const highlightColorSwatch = style({
  display: 'block',
  width: '18px',
  height: '18px',
  borderRadius: '3px',
  border: `1px solid ${themeVars.dynamicColors.divider}`,
});
