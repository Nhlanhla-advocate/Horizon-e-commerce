/**
 * Synonym / typo groups for storefront search. If the user's query relates to a group
 * and the product text matches any variant in that group, the product matches.
 */
export const PRODUCT_SEARCH_SYNONYM_GROUPS = [
  ['playstation', 'play station', 'plastation'],
  [
    'earrings',
    'earings',
    'earing',
    'necklaces',
    'necklace',
    'neklace',
    'neklaces',
    'neclace',
    'neclaces',
  ],
  ['watch', 'watches', 'wotch', 'wotches'],
];

const MIN_SUBSTRING_QUERY_LEN = 4;

function queryReferencesSynonymGroup(searchTerm, group) {
  return group.some((syn) => {
    if (searchTerm.includes(syn)) return true;
    if (searchTerm.length >= MIN_SUBSTRING_QUERY_LEN && syn.includes(searchTerm)) return true;
    return false;
  });
}

function haystackMatchesSynonymGroup(haystack, group) {
  return group.some((syn) => haystack.includes(syn));
}

/**
 * @param {object} product
 * @param {string} searchQuery raw user input
 * @returns {boolean}
 */
export function productMatchesSearchQuery(product, searchQuery) {
  const raw = typeof searchQuery === 'string' ? searchQuery.trim() : '';
  if (!raw) return true;

  const searchTerm = raw.toLowerCase();
  const name = String(product?.name ?? '').toLowerCase();
  const description = String(product?.description ?? '').toLowerCase();
  const category = String(product?.category ?? '').toLowerCase();
  const haystack = `${name} ${description} ${category}`;

  if (haystack.includes(searchTerm)) return true;

  for (const group of PRODUCT_SEARCH_SYNONYM_GROUPS) {
    if (
      queryReferencesSynonymGroup(searchTerm, group) &&
      haystackMatchesSynonymGroup(haystack, group)
    ) {
      return true;
    }
  }

  return false;
}
