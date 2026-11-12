import type {Extension} from '@codemirror/state';
import {Decoration, EditorView} from '@codemirror/view';
import {normalizeColoredRanges} from '../../state/editor/coloredRanges';
import type {ColoredTextRange} from '../../state/editor/model';

export interface ManualHighlightColor {
  id: string;
  color: string;
}

/** Adds non-destructive text-color decorations for the saved manual ranges. */
export function createManualHighlightExtension(
  ranges: readonly ColoredTextRange[],
  colors: readonly ManualHighlightColor[],
  documentLength: number,
): Extension {
  const colorById = new Map<string, string>();
  colors.forEach(({id, color}) => colorById.set(id, color));

  const marks = normalizeColoredRanges(ranges).flatMap(range => {
    const color = colorById.get(range.color);
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
