// Read literal metadata without loading React or the interactive article bodies.
export function parseThinkingMeta(source) {
  const pattern = /meta:\s*\{\s*id:\s*'([^']+)',\s*title:\s*(['"])((?:(?!\2)[\s\S])*?)\2,\s*dek:\s*(['"])((?:(?!\4)[\s\S])*?)\4,\s*date:\s*'([^']+)'/g
  return [...source.matchAll(pattern)].map(match => ({ id: match[1], title: match[3], dek: match[5], date: match[6] }))
}
