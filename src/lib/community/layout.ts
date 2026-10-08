export function communityRows<T>(items: T[], expandedIndex: number, columns: number) {
  const width = Math.max(1, Math.floor(columns) || 1);
  const rows: Array<{ cards: T[]; detailIndex: number | null }> = [];
  for (let index = 0; index < items.length; index += width) {
    const cards = items.slice(index, index + width);
    const local = expandedIndex - index;
    rows.push({
      cards,
      detailIndex: local >= 0 && local < cards.length ? expandedIndex : null,
    });
  }
  return rows;
}

export function columnCountForWidth(width: number) {
  const minCard = 152;
  const gap = 8;
  if (width <= 0) return 1;
  return Math.min(3, Math.max(1, Math.floor((width + gap) / (minCard + gap))));
}
