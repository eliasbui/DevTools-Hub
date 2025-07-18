import { DetectedData } from '@/types/tools';

export function detectDataType(input: string): DetectedData {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { type: 'text', confidence: 1, data: trimmed };
  }

  // JSON detection
  if (isJSON(trimmed)) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        type: 'json',
        confidence: 0.9,
        data: parsed,
        formatted: JSON.stringify(parsed, null, 2)
      };
    } catch (e) {
      // Continue to other detections
    }
  }

  // JWT detection
  if (isJWT(trimmed)) {
    try {
      const parts = trimmed.split('.');
      if (parts.length === 3) {
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        return {
          type: 'jwt',
          confidence: 0.95,
          data: { header, payload, signature: parts[2] },
          formatted: JSON.stringify({ header, payload }, null, 2)
        };
      }
    } catch (e) {
      // Continue to other detections
    }
  }

  // Base64 detection
  if (isBase64(trimmed)) {
    try {
      const decoded = atob(trimmed);
      return {
        type: 'base64',
        confidence: 0.8,
        data: { encoded: trimmed, decoded },
        formatted: decoded
      };
    } catch (e) {
      // Continue to other detections
    }
  }

  // URL detection
  if (isURL(trimmed)) {
    try {
      const url = new URL(trimmed);
      return {
        type: 'url',
        confidence: 0.9,
        data: {
          original: trimmed,
          protocol: url.protocol,
          host: url.host,
          pathname: url.pathname,
          search: url.search,
          hash: url.hash
        },
        formatted: decodeURIComponent(trimmed)
      };
    } catch (e) {
      // Continue to other detections
    }
  }

  // Timestamp detection
  if (isTimestamp(trimmed)) {
    const timestamp = parseInt(trimmed);
    const date = new Date(timestamp * (trimmed.length === 10 ? 1000 : 1));
    return {
      type: 'timestamp',
      confidence: 0.8,
      data: { timestamp, date },
      formatted: date.toISOString()
    };
  }

  // Hex color detection
  if (isHexColor(trimmed)) {
    const hex = trimmed.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return {
      type: 'hex',
      confidence: 0.9,
      data: { hex: trimmed, rgb: { r, g, b } },
      formatted: `rgb(${r}, ${g}, ${b})`
    };
  }

  // XML detection
  if (isXML(trimmed)) {
    return {
      type: 'xml',
      confidence: 0.7,
      data: trimmed,
      formatted: formatXML(trimmed)
    };
  }

  // YAML detection
  if (isYAML(trimmed)) {
    return {
      type: 'yaml',
      confidence: 0.6,
      data: trimmed,
      formatted: trimmed
    };
  }

  return { type: 'text', confidence: 1, data: trimmed };
}

function isJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return str.trim().startsWith('{') || str.trim().startsWith('[');
  } catch (e) {
    return false;
  }
}

function isJWT(str: string): boolean {
  const parts = str.split('.');
  if (parts.length !== 3) return false;
  
  try {
    // Check if all parts are valid base64
    parts.forEach(part => {
      if (!part || part.length === 0) throw new Error('Invalid part');
      atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    });
    return true;
  } catch (e) {
    return false;
  }
}

function isBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str;
  } catch (e) {
    return false;
  }
}

function isURL(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
}

function isTimestamp(str: string): boolean {
  const num = parseInt(str);
  if (isNaN(num)) return false;
  
  // Check if it's a valid Unix timestamp (10 digits) or milliseconds (13 digits)
  const len = str.length;
  if (len === 10 || len === 13) {
    const date = new Date(num * (len === 10 ? 1000 : 1));
    return date.getTime() > 0;
  }
  return false;
}

function isHexColor(str: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(str);
}

function isXML(str: string): boolean {
  return str.trim().startsWith('<') && str.trim().endsWith('>');
}

function isYAML(str: string): boolean {
  // Simple YAML detection - contains colons and proper indentation
  const lines = str.split('\n');
  return lines.some(line => /^\s*\w+:\s*.+/.test(line));
}

function formatXML(xml: string): string {
  // Simple XML formatting
  let formatted = '';
  let indent = 0;
  const tab = '  ';
  
  xml.split(/>\s*</).forEach(node => {
    if (node.match(/^\/\w/)) indent--;
    formatted += tab.repeat(indent) + '<' + node + '>\n';
    if (node.match(/^<?\w[^>]*[^\/]$/)) indent++;
  });
  
  return formatted.substring(1, formatted.length - 2);
}
