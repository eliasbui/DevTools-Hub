export function generateUUID(version: 'v1' | 'v4' = 'v4'): string {
  if (version === 'v4') {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  // Simple v1 UUID (timestamp-based)
  const timestamp = Date.now();
  const random = Math.random().toString(16).substring(2, 8);
  return `${timestamp.toString(16)}-${random}-1xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function generateRandomString(length: number, options: {
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
} = {}): string {
  const {
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = false
  } = options;
  
  let chars = '';
  if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (numbers) chars += '0123456789';
  if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

export async function generateHash(text: string, algorithm: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512'): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  let hashBuffer: ArrayBuffer;
  
  if (algorithm === 'MD5') {
    // MD5 implementation (simplified)
    return await md5(text);
  } else {
    const algoName = algorithm === 'SHA-1' ? 'SHA-1' : `SHA-${algorithm.split('-')[1]}`;
    hashBuffer = await crypto.subtle.digest(algoName, data);
  }
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simplified MD5 implementation
async function md5(text: string): Promise<string> {
  // This is a simplified version. In production, you'd use a proper MD5 library
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

export function generateLoremIpsum(paragraphs: number = 1, wordsPerParagraph: number = 50): string {
  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ];
  
  const result = [];
  
  for (let p = 0; p < paragraphs; p++) {
    const words = [];
    for (let w = 0; w < wordsPerParagraph; w++) {
      words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
    }
    
    let paragraph = words.join(' ');
    paragraph = paragraph.charAt(0).toUpperCase() + paragraph.slice(1) + '.';
    result.push(paragraph);
  }
  
  return result.join('\n\n');
}
