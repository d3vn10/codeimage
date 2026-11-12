import type {Extension} from '@codemirror/state';
import {Decoration, EditorView} from '@codemirror/view';
import {normalizeColoredRanges} from '../../state/editor/coloredRanges';
import type {ColoredTextRange} from '../../state/editor/model';

export interface ManualSyntaxCategory {
  id: string;
  color: string;
}

/** Applies a theme's syntax color to manually categorized text ranges. */
export function createManualHighlightExtension(
  ranges: readonly ColoredTextRange[],
  categories: readonly ManualSyntaxCategory[],
  documentLength: number,
): Extension {
  const colorByCategory = new Map<string, string>();
  categories.forEach(({id, color}) => colorByCategory.set(id, color));

  const marks = normalizeColoredRanges(ranges).flatMap(range => {
    // `range.color` stores the category ID for saved-project compatibility.
    const color = colorByCategory.get(range.color);
    const from = Math.max(0, Math.min(range.from, documentLength));
    const to = Math.max(0, Math.min(range.to, documentLength));
    if (!color || to <= from) return [];
    return [
      Decoration.mark({
        attributes: {
          style: `color: ${color} !important`,
        },
      }).range(from, to),
    ];
  });

  return EditorView.decorations.of(Decoration.set(marks, true));
}
