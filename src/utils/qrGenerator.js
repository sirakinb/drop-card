/**
 * QR Code generator utilities for business cards
 */

/**
 * Converts a business card object to standard vCard format
 * @param {Object} card - The business card data
 * @returns {string} - vCard formatted string
 */
export const generateVCard = (card) => {
  if (!card || !card.name) {
    throw new Error('Card data is invalid or missing required fields');
  }

  // Start building the vCard
  let vCardString = 'BEGIN:VCARD\r\nVERSION:3.0\r\n';
  
  // Add name
  vCardString += `FN:${escapeVCardValue(card.name)}\r\n`;
  
  // Split name into parts if possible (optional)
  const nameParts = card.name.split(' ');
  if (nameParts.length > 1) {
    const lastName = nameParts.pop();
    const firstName = nameParts.join(' ');
    vCardString += `N:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;\r\n`;
  } else {
    vCardString += `N:${escapeVCardValue(card.name)};;;;\r\n`;
  }
  
  // Add organization and title if available
  if (card.company) {
    vCardString += `ORG:${escapeVCardValue(card.company)}\r\n`;
  }
  
  if (card.title) {
    vCardString += `TITLE:${escapeVCardValue(card.title)}\r\n`;
  }
  
  // Add contact details if available
  if (card.phone) {
    vCardString += `TEL;TYPE=CELL:${escapeVCardValue(card.phone)}\r\n`;
  }
  
  if (card.email) {
    vCardString += `EMAIL:${escapeVCardValue(card.email)}\r\n`;
  }
  
  if (card.website) {
    vCardString += `URL:${escapeVCardValue(card.website)}\r\n`;
  }
  
  // Add social media as URLs if available
  if (card.linkedin) {
    const linkedinUrl = card.linkedin.startsWith('http') 
      ? card.linkedin 
      : `https://www.linkedin.com/in/${card.linkedin}`;
    vCardString += `URL;TYPE=LINKEDIN:${escapeVCardValue(linkedinUrl)}\r\n`;
  }
  
  if (card.twitter) {
    const twitterUrl = card.twitter.startsWith('http') 
      ? card.twitter 
      : `https://twitter.com/${card.twitter.replace('@', '')}`;
    vCardString += `URL;TYPE=TWITTER:${escapeVCardValue(twitterUrl)}\r\n`;
  }
  
  // Add note/bio if available
  if (card.bio) {
    vCardString += `NOTE:${escapeVCardValue(card.bio)}\r\n`;
  }
  
  // Add photo if available (as base64)
  if (card.photoUri) {
    if (card.photoUri.startsWith('data:image')) {
      // Already base64, extract just the data part
      const base64Data = card.photoUri.split(',')[1];
      vCardString += `PHOTO;ENCODING=b;TYPE=JPEG:${base64Data}\r\n`;
    } else if (card.photoUri.startsWith('file://') || card.photoUri.startsWith('content://')) {
      // Local file URI - we can't include this directly in vCard
      // For now, we'll skip it as we can't read the file content here
    }
  }
  
  // End vCard
  vCardString += 'END:VCARD';
  
  return vCardString;
};

/**
 * Escapes special characters in vCard values
 * @param {string} value - The value to escape
 * @returns {string} - Escaped value
 */
const escapeVCardValue = (value) => {
  if (!value) return '';
  
  // Escape backslashes, commas, semicolons, and newlines as per vCard spec
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
};

/**
 * Generates a deep link URL for a business card
 * @param {Object} card - The business card data
 * @param {string} appScheme - The app's URL scheme (e.g., 'dropcard://')
 * @returns {string} - Deep link URL
 */
export const generateDeepLink = (card, appScheme = 'dropcard://') => {
  if (!card || !card.id) {
    throw new Error('Card data is invalid or missing ID');
  }
  
  // Create a simple deep link with the card ID
  return `${appScheme}card/${card.id}`;
};

/**
 * Generates a shareable text representation of a business card
 * @param {Object} card - The business card data
 * @returns {string} - Formatted text
 */
export const generateShareableText = (card) => {
  if (!card || !card.name) {
    throw new Error('Card data is invalid or missing required fields');
  }
  
  let text = `${card.name}\n`;
  
  if (card.title) {
    text += `${card.title}\n`;
  }
  
  if (card.company) {
    text += `${card.company}\n`;
  }
  
  if (card.phone || card.email || card.website) {
    text += '\n';
  }
  
  if (card.phone) {
    text += `📱 ${card.phone}\n`;
  }
  
  if (card.email) {
    text += `📧 ${card.email}\n`;
  }
  
  if (card.website) {
    text += `🌐 ${card.website}\n`;
  }
  
  if (card.linkedin || card.twitter) {
    text += '\n';
  }
  
  if (card.linkedin) {
    text += `LinkedIn: ${card.linkedin}\n`;
  }
  
  if (card.twitter) {
    text += `Twitter: ${card.twitter}\n`;
  }
  
  return text;
};

/**
 * Parses a vCard string into a business card object
 * @param {string} vCardString - The vCard string to parse
 * @returns {Object} - Business card object
 */
export const parseVCard = (vCardString) => {
  if (!vCardString || !vCardString.includes('BEGIN:VCARD')) {
    throw new Error('Invalid vCard format');
  }
  
  const card = {};
  
  // Split into lines and process each property
  const lines = vCardString.split(/\r\n|\r|\n/);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip BEGIN and END lines
    if (line.startsWith('BEGIN:') || line.startsWith('END:')) {
      continue;
    }
    
    // Handle folded lines (lines that start with a space)
    let currentLine = line;
    while (i + 1 < lines.length && lines[i + 1].startsWith(' ')) {
      currentLine += lines[i + 1].substring(1);
      i++;
    }
    
    // Split into property name and value
    const colonIndex = currentLine.indexOf(':');
    if (colonIndex === -1) continue;
    
    const propertyName = currentLine.substring(0, colonIndex);
    const propertyValue = currentLine.substring(colonIndex + 1);
    
    // Parse common properties
    if (propertyName === 'FN') {
      card.name = unescapeVCardValue(propertyValue);
    } else if (propertyName === 'ORG') {
      card.company = unescapeVCardValue(propertyValue);
    } else if (propertyName === 'TITLE') {
      card.title = unescapeVCardValue(propertyValue);
    } else if (propertyName.startsWith('TEL')) {
      card.phone = unescapeVCardValue(propertyValue);
    } else if (propertyName.startsWith('EMAIL')) {
      card.email = unescapeVCardValue(propertyValue);
    } else if (propertyName === 'URL' || propertyName === 'URL;TYPE=WORK') {
      card.website = unescapeVCardValue(propertyValue);
    } else if (propertyName === 'URL;TYPE=LINKEDIN') {
      card.linkedin = unescapeVCardValue(propertyValue);
    } else if (propertyName === 'URL;TYPE=TWITTER') {
      card.twitter = unescapeVCardValue(propertyValue);
    } else if (propertyName === 'NOTE') {
      card.bio = unescapeVCardValue(propertyValue);
    }
    // Photo handling is more complex and would require additional processing
  }
  
  return card;
};

/**
 * Unescapes special characters in vCard values
 * @param {string} value - The value to unescape
 * @returns {string} - Unescaped value
 */
const unescapeVCardValue = (value) => {
  if (!value) return '';
  
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\;/g, ';')
    .replace(/\\,/g, ',')
    .replace(/\\\\/g, '\\');
};

export default {
  generateVCard,
  generateDeepLink,
  generateShareableText,
  parseVCard
};
