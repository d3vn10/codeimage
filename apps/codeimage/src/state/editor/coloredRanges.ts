import type {ColoredTextRange} from './model';

export interface TextSelectionRange {
  from: number;
  to: number;
}

interface ChangeMapping {
  mapPos(position: number, association?: number): number;
}

export function normalizeColoredRanges(
  ranges: readonly ColoredTextRange[],
): ColoredTextRange[] {
  const sorted = ranges
    .filter(
      range =>
        Number.isInteger(range.from) &&
        Number.isInteger(range.to) &&
        range.from >= 0 &&
        range.to > range.from &&
        !!range.color,
    )
    .map(range => ({...range}))
    .sort((a, b) => a.from - b.from || a.to - b.to);

  const normalized: ColoredTextRange[] = [];
  for (const range of sorted) {
    const previous = normalized[normalized.length - 1];
    if (!previous || range.from >= previous.to) {
      if (previous && previous.color === range.color && previous.to === range.from) {
        previous.to = range.to;
      } else {
        normalized.push(range);
      }
      continue;
    }

    if (previous.color === range.color) {
      previous.to = Math.max(previous.to, range.to);
    } else if (range.to > previous.to) {
      normalized.push({...range, from: previous.to});
    }
  }
  return normalized;
}

export function applyColorToSelections(
  currentRanges: readonly ColoredTextRange[],
  selections: readonly TextSelectionRange[],
  color: string | null,
): ColoredTextRange[] {
  let next = normalizeColoredRanges(currentRanges);
  const selected = selections
    .filter(selection => selection.to > selection.from)
    .map(selection => ({...selection}))
    .sort((a, b) => a.from - b.from);

  for (const selection of selected) {
    next = next.flatMap(range => {
      if (range.to <= selection.from || range.from >= selection.to) {
        return [range];
      }
      const remaining: ColoredTextRange[] = [];
      if (range.from < selection.from) {
        remaining.push({...range, to: selection.from});
      }
      if (range.to > selection.to) {
        remaining.push({...range, from: selection.to});
      }
      return remaining;
    });
    if (color) next.push({...selection, color});
  }

  return normalizeColoredRanges(next);
}

export function mapColoredRangesThroughChanges(
  ranges: readonly ColoredTextRange[],
  changes: readonly ChangeMapping[],
): ColoredTextRange[] {
  let mapped = ranges.map(range => ({...range}));
  for (const change of changes) {
    mapped = mapped.map(range => ({
      ...range,
      from: change.mapPos(range.from, -1),
      to: change.mapPos(range.to, 1),
    }));
  }
  return normalizeColoredRanges(mapped);
}

/**
 * Keeps ranges outside a programmatically replaced text region. Any color
 * intersecting the replacement is dropped rather than being applied to
 * unrelated text after formatting.
 */
export function mapColoredRangesThroughTextReplacement(
  ranges: readonly ColoredTextRange[],
  previousText: string,
  nextText: string,
): ColoredTextRange[] {
  if (previousText === nextText) return normalizeColoredRanges(ranges);

  let prefixLength = 0;
  const prefixLimit = Math.min(previousText.length, nextText.length);
  while (
    prefixLength < prefixLimit &&
    previousText[prefixLength] === nextText[prefixLength]
  ) {
    prefixLength += 1;
  }

  let suffixLength = 0;
  while (
    suffixLength < previousText.length - prefixLength &&
    suffixLength < nextText.length - prefixLength &&
    previousText[previousText.length - suffixLength - 1] ===
      nextText[nextText.length - suffixLength - 1]
  ) {
    suffixLength += 1;
  }

  const previousChangedEnd = previousText.length - suffixLength;
  const nextChangedEnd = nextText.length - suffixLength;
  const offset = nextChangedEnd - previousChangedEnd;

  return normalizeColoredRanges(
    ranges.flatMap(range => {
      const preserved: ColoredTextRange[] = [];

      if (range.from < prefixLength) {
        const to = Math.min(range.to, prefixLength);
        if (to > range.from) preserved.push({...range, to});
      }

      if (range.to > previousChangedEnd) {
        const from = Math.max(range.from, previousChangedEnd) + offset;
        const to = range.to + offset;
        if (to > from) preserved.push({...range, from, to});
      }

      return preserved;
    }),
  );
}
