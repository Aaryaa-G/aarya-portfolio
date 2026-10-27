(() => {
  const data = window.portfolioData;
  const table = data.morseTable;
  const encode = value => [...value.toUpperCase()].map(char => table[char] ? { char, code: table[char] } : null).filter(Boolean);
  const escape = value => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  window.morseTools = { table, encode, escape };
})();
