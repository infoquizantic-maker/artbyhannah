// Currency helper — all prices across the site are in Pakistani Rupees (PKR)

export const formatPKR = (amount) => {
  const value = Number(amount) || 0;
  return `Rs ${value.toLocaleString('en-PK')}`;
};

export const CURRENCY_SYMBOL = 'Rs';
