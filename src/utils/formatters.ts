export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('pt-BR');
};

export const parseNumber = (value: string): number => {
  return parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
};