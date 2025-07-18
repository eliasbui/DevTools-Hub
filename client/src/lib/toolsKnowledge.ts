// Knowledge base for all tools
export interface ToolKnowledge {
  name: string;
  description: string;
  input: string;
  output: string;
  usage: string;
  examples?: string[];
}

export const toolsKnowledgeBase: Record<string, ToolKnowledge> = {
  'json-formatter': {
    name: 'JSON Formatter',
    description: 'A tool to format, validate, and minify JSON data with syntax highlighting and error detection.',
    input: 'Raw JSON string or object that needs formatting. Can be pasted directly or typed manually.',
    output: 'Formatted JSON with proper indentation, syntax highlighting, and validation results. Can also output minified JSON.',
    usage: 'Paste your JSON data into the input field. The tool will automatically validate and format it. Use the Format button for pretty-printing or Minify to compress the JSON.',
    examples: ['{"name": "John", "age": 30}', '[1, 2, 3, {"key": "value"}]']
  },
  
  'base64-tool': {
    name: 'Base64 Encoder/Decoder',
    description: 'Encode text or binary data to Base64 format or decode Base64 strings back to their original form.',
    input: 'Plain text for encoding or Base64 string for decoding.',
    output: 'Base64 encoded string when encoding, or decoded text/binary data when decoding.',
    usage: 'Enter your text in the input field and click Encode to convert to Base64, or paste a Base64 string and click Decode to get the original text.',
    examples: ['Hello World => SGVsbG8gV29ybGQ=', 'SGVsbG8gV29ybGQ= => Hello World']
  },
  
  'url-encoder': {
    name: 'URL Encoder/Decoder',
    description: 'Encode special characters in URLs or decode URL-encoded strings.',
    input: 'URL with special characters for encoding, or URL-encoded string for decoding.',
    output: 'URL-safe encoded string or decoded URL with original characters.',
    usage: 'Paste your URL or text with special characters to encode it for safe URL usage, or decode existing URL-encoded strings.',
    examples: ['hello world => hello%20world', 'user@example.com => user%40example.com']
  },
  
  'timestamp-converter': {
    name: 'Timestamp Converter',
    description: 'Convert Unix timestamps to human-readable dates and vice versa, with timezone support.',
    input: 'Unix timestamp (seconds or milliseconds) or date string in various formats.',
    output: 'Converted date in multiple formats with timezone information, or Unix timestamp.',
    usage: 'Enter a Unix timestamp to see the date, or input a date to get the timestamp. Supports multiple date formats and timezones.',
    examples: ['1640995200 => 2022-01-01 00:00:00', '2024-12-25 => 1735084800']
  },
  
  'jwt-debugger': {
    name: 'JWT Debugger',
    description: 'Decode and inspect JSON Web Tokens (JWT) to view header, payload, and signature information.',
    input: 'Complete JWT token string (header.payload.signature format).',
    output: 'Decoded header and payload in JSON format, signature verification status, and token metadata.',
    usage: 'Paste your JWT token to decode and inspect its contents. The tool shows header, payload, and indicates if the signature is present.',
    examples: ['eyJhbGciOiJIUzI1NiIs...']
  },
  
  'regex-tester': {
    name: 'Regex Tester',
    description: 'Test regular expressions against text with real-time matching, groups, and flags support.',
    input: 'Regular expression pattern and test text to match against.',
    output: 'Matched results with highlighting, captured groups, and match positions.',
    usage: 'Enter your regex pattern and test text. Select flags (g, i, m) as needed. Matches are highlighted in real-time.',
    examples: ['/[a-z]+/gi matches all words', '/\\d{3}-\\d{3}-\\d{4}/ matches phone numbers']
  },
  
  'text-diff': {
    name: 'Text Diff Checker',
    description: 'Compare two texts side-by-side and highlight the differences between them.',
    input: 'Two text blocks to compare (original and modified versions).',
    output: 'Visual diff showing additions, deletions, and modifications with line numbers.',
    usage: 'Paste the original text in the left panel and modified text in the right panel. Differences are automatically highlighted.',
    examples: ['Compare code versions', 'Track document changes']
  },
  
  'uuid-generator': {
    name: 'UUID Generator',
    description: 'Generate universally unique identifiers (UUID) in various versions (v1, v4, v5).',
    input: 'Optional namespace and name for v5 UUIDs, or no input for v1/v4.',
    output: 'Generated UUID string in standard format (8-4-4-4-12 hexadecimal digits).',
    usage: 'Select UUID version and click Generate. For v5, provide namespace and name. Can generate multiple UUIDs at once.',
    examples: ['550e8400-e29b-41d4-a716-446655440000', '6ba7b810-9dad-11d1-80b4-00c04fd430c8']
  },
  
  'hash-generator': {
    name: 'Hash Generator',
    description: 'Generate cryptographic hashes using MD5, SHA-1, SHA-256, SHA-512, and other algorithms.',
    input: 'Text or file content to hash.',
    output: 'Hash digest in hexadecimal format for selected algorithm(s).',
    usage: 'Enter text or upload a file, select hash algorithms, and generate. Can compute multiple hashes simultaneously.',
    examples: ['MD5: 5d41402abc4b2a76b9719d911017c592', 'SHA-256: 2c26b46b68ffc68ff99b453c1d304134']
  },
  
  'password-generator': {
    name: 'Password Generator',
    description: 'Generate secure passwords with customizable length and character requirements.',
    input: 'Password requirements: length, character types (uppercase, lowercase, numbers, symbols).',
    output: 'Randomly generated secure password meeting specified criteria.',
    usage: 'Set password length and select character types to include. Click Generate for a new password. Shows strength indicator.',
    examples: ['Kj7#mN9@pL2x', 'SecurePass123!', 'a8b3c5d7e9f2']
  },
  
  'color-palette': {
    name: 'Color Palette Generator',
    description: 'Generate harmonious color schemes using color theory principles.',
    input: 'Base color in HEX format and palette type selection.',
    output: 'Color palette with multiple colors in HEX, RGB, and HSL formats, exportable as JSON.',
    usage: 'Choose a base color and palette type (complementary, analogous, triadic, etc.). Adjust the number of colors. Click on any color to copy.',
    examples: ['#3b82f6 complementary', '#ff6b6b monochromatic']
  },
  
  'color-converter': {
    name: 'Color Converter',
    description: 'Convert colors between different formats: HEX, RGB, HSL, HSV, CMYK, and LAB.',
    input: 'Color value in any supported format (HEX, RGB, HSL).',
    output: 'Color converted to all formats with visual preview and variations.',
    usage: 'Enter a color in any format. The tool converts to all other formats. Click any value to copy. Shows color variations.',
    examples: ['#ff0000 => rgb(255,0,0)', 'hsl(120,100%,50%) => #00ff00']
  },
  
  'sql-formatter': {
    name: 'SQL Formatter',
    description: 'Format and beautify SQL queries with proper indentation and syntax highlighting.',
    input: 'Raw SQL query string.',
    output: 'Formatted SQL with consistent indentation, keyword capitalization, and syntax highlighting.',
    usage: 'Paste your SQL query and click Format. Choose formatting options like keyword case and indentation style.',
    examples: ['SELECT * FROM users WHERE age > 18', 'INSERT INTO table VALUES (1, "data")']
  },
  
  'yaml-converter': {
    name: 'YAML Converter',
    description: 'Convert between YAML, JSON, and XML formats bidirectionally.',
    input: 'Data in YAML, JSON, or XML format.',
    output: 'Data converted to the selected target format with proper formatting.',
    usage: 'Paste your data in any supported format, select the target format, and convert. Validates input before conversion.',
    examples: ['YAML to JSON', 'JSON to XML', 'XML to YAML']
  },
  
  'text-statistics': {
    name: 'Text Statistics',
    description: 'Analyze text for word count, character count, reading time, readability score, and more.',
    input: 'Any text content for analysis.',
    output: 'Comprehensive statistics including word/character counts, sentences, paragraphs, reading time, and readability metrics.',
    usage: 'Paste or type your text. Statistics update in real-time. Shows readability score and estimated reading time.',
    examples: ['Blog posts', 'Essays', 'Articles']
  },
  
  'unit-converter': {
    name: 'Unit Converter',
    description: 'Convert between various units of measurement including length, weight, temperature, and data sizes.',
    input: 'Numeric value with source unit.',
    output: 'Converted value in the target unit with precision control.',
    usage: 'Enter a value, select source and target units, and see instant conversion. Supports many unit categories.',
    examples: ['100 km to miles', '32°F to °C', '1GB to MB']
  },
  
  'csv-converter': {
    name: 'CSV Converter',
    description: 'Convert CSV data to JSON, XML, YAML, or SQL insert statements.',
    input: 'CSV data with optional headers.',
    output: 'Data converted to selected format with proper structure and formatting.',
    usage: 'Paste CSV data, configure delimiter and headers, select output format. Handles complex CSV with quotes and escaping.',
    examples: ['CSV to JSON array', 'CSV to SQL INSERT statements']
  },
  
  'http-client': {
    name: 'HTTP Client',
    description: 'Send HTTP requests and test APIs with support for all methods, headers, and body types.',
    input: 'URL, HTTP method, headers, and request body.',
    output: 'Response status, headers, body, and timing information. Can generate cURL commands.',
    usage: 'Enter URL, select method, add headers and body as needed. Send request to see response. History is saved.',
    examples: ['GET https://api.example.com/users', 'POST with JSON body']
  },
  
  'cron-expression-builder': {
    name: 'Cron Expression Builder',
    description: 'Build and validate cron expressions visually with next execution time preview.',
    input: 'Time schedule requirements or existing cron expression.',
    output: 'Valid cron expression with human-readable description and next run times.',
    usage: 'Use visual controls to set schedule or paste existing cron expression. Shows next 5 execution times.',
    examples: ['0 0 * * * (daily at midnight)', '*/5 * * * * (every 5 minutes)']
  },
  
  'file-checksum-calculator': {
    name: 'File Checksum Calculator',
    description: 'Calculate various checksums and hashes for files including MD5, SHA-256, SHA-512, and more.',
    input: 'File upload (processed locally in browser).',
    output: 'Multiple hash values for the file in hexadecimal format.',
    usage: 'Select or drag a file to calculate checksums. Supports multiple algorithms simultaneously. All processing is local.',
    examples: ['Verify file integrity', 'Generate file fingerprints']
  },
  
  'image-converter': {
    name: 'Image Converter',
    description: 'Convert images between formats (JPEG, PNG, WebP, AVIF) with quality and size optimization.',
    input: 'Image file in supported format.',
    output: 'Converted image in selected format with optional optimization.',
    usage: 'Upload image, select target format and quality. Preview before downloading. Supports batch conversion.',
    examples: ['PNG to WebP', 'JPEG optimization']
  },
  
  'svg-optimizer': {
    name: 'SVG Optimizer',
    description: 'Optimize SVG files for web by removing unnecessary data and cleaning up code.',
    input: 'SVG file or code.',
    output: 'Optimized SVG with reduced file size and cleaner code.',
    usage: 'Upload SVG or paste code. Configure optimization options. See size reduction percentage.',
    examples: ['Remove metadata', 'Minify paths', 'Convert to viewBox']
  }
};