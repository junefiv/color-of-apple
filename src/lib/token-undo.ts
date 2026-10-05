export function undoToken(
  path: string,
  overrides: Record<string, string>,
  history: Array<Record<string, string>>,
) {
  let index = history.length - 1;
  while (index >= 0 && history[index][path] === overrides[path]) index--;
  if (index < 0) return null;
  const previous = history[index][path];
  const restore = (entry: Record<string, string>) => {
    const next = { ...entry };
    if (previous === undefined) delete next[path];
    else next[path] = previous;
    return next;
  };
  return {
    overrides: restore(overrides),
    history: history.map((entry, i) => i >= index ? restore(entry) : entry),
  };
}
