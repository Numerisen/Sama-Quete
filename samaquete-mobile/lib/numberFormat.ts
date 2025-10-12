/**
 * Formate un nombre avec des espaces comme séparateurs de milliers
 * @param num - Le nombre à formater
 * @returns Le nombre formaté avec des espaces (ex: 1 000, 10 000, 122 000)
 */
export function formatNumber(num: number | string): string {
  const number = typeof num === 'string' ? parseFloat(num.replace(/[^\d.-]/g, '')) : num;
  
  if (isNaN(number)) return '0';
  
  return number.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).replace(/,/g, ' ');
}

/**
 * Formate un montant en FCFA avec des espaces
 * @param amount - Le montant à formater
 * @returns Le montant formaté (ex: "1 000 FCFA")
 */
export function formatAmount(amount: number | string): string {
  return `${formatNumber(amount)} FCFA`;
}

/**
 * Formate un prix pour l'affichage dans les cartes de don
 * @param price - Le prix à formater (nombre ou string)
 * @returns Le prix formaté (ex: "1 000")
 */
export function formatPrice(price: number | string): string {
  // Si c'est déjà un nombre, le formater directement
  if (typeof price === 'number') {
    return formatNumber(price);
  }
  
  // Si c'est une string qui contient déjà des virgules, les remplacer par des espaces
  if (price.includes(',')) {
    return price.replace(/,/g, ' ');
  }
  
  // Sinon, formater le nombre
  const num = parseFloat(price.replace(/[^\d.-]/g, ''));
  return formatNumber(num);
}
