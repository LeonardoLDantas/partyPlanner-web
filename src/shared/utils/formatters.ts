export const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR');
}
