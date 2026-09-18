export const formatCurrency = (value: any): string => {
  if (value === null || value === undefined) return '0';
  
  let numericValue = 0;
  
  if (typeof value === 'number') {
    numericValue = value;
  } else if (typeof value === 'string') {
    numericValue = parseFloat(value);
  } else if (typeof value === 'object') {
    // Handling Prisma Decimal serialized as object (e.g. Decimal.js)
    // Often it comes as a string representation in a standard JSON.stringify, but if custom serialized it might have .toString()
    if (value.toString && typeof value.toString === 'function' && value.toString() !== '[object Object]') {
      numericValue = parseFloat(value.toString());
    } else if (value.d && Array.isArray(value.d)) {
      // Very fallback for Decimal.js internal structure if exposed
      numericValue = parseFloat(value.d.join(''));
    }
  }

  if (isNaN(numericValue)) {
    return '0';
  }

  return numericValue.toLocaleString('vi-VN');
};
