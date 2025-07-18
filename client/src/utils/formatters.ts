export function formatJSON(json: string): string {
  try {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    throw new Error('Invalid JSON');
  }
}

export function minifyJSON(json: string): string {
  try {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed);
  } catch (e) {
    throw new Error('Invalid JSON');
  }
}

export function validateJSON(json: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(json);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

export function encodeBase64(text: string): string {
  return btoa(text);
}

export function decodeBase64(base64: string): string {
  try {
    return atob(base64);
  } catch (e) {
    throw new Error('Invalid Base64');
  }
}

export function encodeURL(url: string): string {
  return encodeURIComponent(url);
}

export function decodeURL(url: string): string {
  try {
    return decodeURIComponent(url);
  } catch (e) {
    throw new Error('Invalid URL encoding');
  }
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * (timestamp.toString().length === 10 ? 1000 : 1));
  return date.toISOString();
}

export function parseTimestamp(dateStr: string): number {
  const date = new Date(dateStr);
  return Math.floor(date.getTime() / 1000);
}

export function parseJWT(token: string): { header: any; payload: any; signature: string } {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }
  
  try {
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    return { header, payload, signature: parts[2] };
  } catch (e) {
    throw new Error('Invalid JWT');
  }
}

export function diffStrings(str1: string, str2: string): Array<{ type: 'added' | 'removed' | 'unchanged'; value: string }> {
  const lines1 = str1.split('\n');
  const lines2 = str2.split('\n');
  const result: Array<{ type: 'added' | 'removed' | 'unchanged'; value: string }> = [];
  
  const maxLength = Math.max(lines1.length, lines2.length);
  
  for (let i = 0; i < maxLength; i++) {
    const line1 = lines1[i];
    const line2 = lines2[i];
    
    if (line1 === undefined) {
      result.push({ type: 'added', value: line2 });
    } else if (line2 === undefined) {
      result.push({ type: 'removed', value: line1 });
    } else if (line1 === line2) {
      result.push({ type: 'unchanged', value: line1 });
    } else {
      result.push({ type: 'removed', value: line1 });
      result.push({ type: 'added', value: line2 });
    }
  }
  
  return result;
}

export function testRegex(pattern: string, flags: string, testString: string): {
  matches: RegExpMatchArray[];
  isValid: boolean;
  error?: string;
} {
  try {
    const regex = new RegExp(pattern, flags);
    const matches: RegExpMatchArray[] = [];
    
    if (flags.includes('g')) {
      let match;
      while ((match = regex.exec(testString)) !== null) {
        matches.push(match);
      }
    } else {
      const match = testString.match(regex);
      if (match) matches.push(match);
    }
    
    return { matches, isValid: true };
  } catch (e) {
    return { matches: [], isValid: false, error: (e as Error).message };
  }
}
