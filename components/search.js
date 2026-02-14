// Highlight helper: marca apenas trechos retornados pelo Fuse para evidenciar correspondências reais.
export const highlightTextByMatches = (text, indices = []) => {
  if (!text || !indices.length) return text;

  let cursor = 0;
  let output = '';

  indices.forEach(([start, end]) => {
    if (start > cursor) output += text.slice(cursor, start);
    output += `<mark class="rounded bg-yellow-200 px-0.5">${text.slice(start, end + 1)}</mark>`;
    cursor = end + 1;
  });

  if (cursor < text.length) output += text.slice(cursor);
  return output;
};

// Agrupamento: organiza resultados por tipo para manter leitura clara na página de busca.
export const groupFuseResults = (fuseResults) => {
  const grouped = {
    Categorias: [],
    Fluxos: [],
    Rede: [],
  };

  fuseResults.forEach((result) => {
    const item = result.item;
    const titleMatch = result.matches?.find((match) => match.key === 'title');
    const descMatch = result.matches?.find((match) => match.key === 'description');

    const entry = {
      id: item.id,
      title: highlightTextByMatches(item.title, titleMatch?.indices || []),
      description: highlightTextByMatches(item.description, descMatch?.indices || []),
    };

    grouped[item.group].push(entry);
  });

  return grouped;
};
