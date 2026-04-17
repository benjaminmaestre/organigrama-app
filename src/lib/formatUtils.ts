/**
 * Formats a phone number string for visual display.
 * Input: "+573174407009"
 * Output: "+57 317 440 7009"
 */
export const formatPhoneForDisplay = (phone: string | undefined): string => {
  if (!phone) return '';
  
  // Remove all non-digits except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Check if it matches the expected Colombian format: +57 followed by 10 digits
  const match = cleaned.match(/^(\+57)(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }
  
  // Fallback for other formats
  return phone;
};

/**
 * Returns a clean string for WhatsApp links (no + and no spaces)
 */
export const cleanPhoneForWhatsApp = (phone: string | undefined): string => {
  if (!phone) return '';
  return phone.replace(/[^\d]/g, '');
};
