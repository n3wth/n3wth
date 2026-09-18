export interface SearchSection {
  id: string;
  title: string;
  heading: string;
  href: string;
  content: string;
}

const stopWords = new Set('a an and are as at be by can do does for from how i in is it my of on or r3 that the this to use what when where which with you'.split(' '));
const tokens = (text: string): string[] => text.toLowerCase().replaceAll('\\_', '_').match(/[a-z0-9_]+/g) || [];

// A shared, deterministic ranker keeps local results and AI grounding aligned.
export function searchDocs(sections: SearchSection[], query: string, limit = 6) {
  const terms = [...new Set(tokens(query).filter((word) => !stopWords.has(word)))].slice(0, 24);
  if (!terms.length) return [];
  const frequencies = terms.map((term) => sections.filter((s) => tokens(`${s.title} ${s.heading} ${s.content}`).includes(term)).length);
  return sections.map((section) => {
    const body = tokens(section.content);
    const title = tokens(`${section.title} ${section.heading}`);
    let matched = 0;
    const score = terms.reduce((total, term, index) => {
      const count = body.filter((word) => word === term).length;
      const inTitle = title.includes(term);
      if (count || inTitle) matched++;
      const idf = Math.log(1 + sections.length / (1 + frequencies[index]));
      return total + idf * ((count * 2.2) / (count + 1.2 * (0.25 + 0.75 * body.length / 200)) + (inTitle ? 3 : 0));
    }, 0) * (matched / terms.length);
    return { ...section, score };
  }).filter((result) => result.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}

export function searchExcerpt(content: string, query: string) {
  const terms = tokens(query).filter((term) => !stopWords.has(term));
  const plain = content.replace(/[`#*|]/g, '').replace(/\s+/g, ' ').trim();
  const positions = terms.map((term) => plain.toLowerCase().indexOf(term)).filter((index) => index >= 0);
  const start = Math.max(0, (positions.length ? Math.min(...positions) : 0) - 50);
  return `${start ? '…' : ''}${plain.slice(start, start + 200)}${plain.length > start + 200 ? '…' : ''}`;
}
