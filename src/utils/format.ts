
export const formatCurrency = (value: number | string): string => {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(amount)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};


export const parseBrazilianNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  let cleanValue = value.replace('R$', '').trim();
  
  if (cleanValue.includes(',')) {
    cleanValue = cleanValue.split('.').join('').replace(',', '.');
  } 
  else if (cleanValue.includes('.')) {
    const parts = cleanValue.split('.');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      cleanValue = cleanValue.split('.').join('');
    }
  }
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};
