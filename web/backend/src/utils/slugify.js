const slugify = (text = '') => {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const formatOMR = (amount) => {
  const num = Number(amount || 0);
  return `OMR ${num.toFixed(3)}`;
};

module.exports = {
  slugify,
  formatOMR,
};
