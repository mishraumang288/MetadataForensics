function readPdfLiteralString(source, startIndex) {
  let index = startIndex + 1;
  let depth = 1;
  let escaped = false;
  let value = '';

  while (index < source.length) {
    const character = source[index];

    if (escaped) {
      if (character >= '0' && character <= '7') {
        let octal = character;
        let lookahead = 1;

        while (lookahead < 3 && index + lookahead < source.length) {
          const nextCharacter = source[index + lookahead];
          if (nextCharacter < '0' || nextCharacter > '7') {
            break;
          }

          octal += nextCharacter;
          lookahead += 1;
        }

        value += String.fromCharCode(parseInt(octal, 8));
        index += lookahead - 1;
      } else if (character === 'n') {
        value += '\n';
      } else if (character === 'r') {
        value += '\r';
      } else if (character === 't') {
        value += '\t';
      } else if (character === 'b') {
        value += '\b';
      } else if (character === 'f') {
        value += '\f';
      } else {
        value += character;
      }

      escaped = false;
    } else if (character === '\\') {
      escaped = true;
    } else if (character === '(') {
      depth += 1;
      value += character;
    } else if (character === ')') {
      depth -= 1;
      if (depth === 0) {
        return { value, nextIndex: index + 1 };
      }
      value += character;
    } else {
      value += character;
    }

    index += 1;
  }

  return { value, nextIndex: source.length };
}

export async function extractPdfMetadata(file) {
  const buffer = await file.arrayBuffer();
  const text = new TextDecoder('latin1').decode(buffer);
  const metadata = {};
  const keys = ['Title', 'Author', 'Subject', 'Keywords', 'Creator', 'Producer', 'ModDate', 'CreationDate'];

  keys.forEach((key) => {
    const pattern = new RegExp(`\\/${key}\\s*\\(`, 'g');
    const match = pattern.exec(text);

    if (!match) {
      return;
    }

    const { value } = readPdfLiteralString(text, match.index + match[0].length - 1);
    metadata[key] = value;
  });

  const xmpMatch = /<xmp:Codeword>([^<]+)<\/xmp:Codeword>/.exec(text);
  if (xmpMatch) {
    metadata['XMP_Description'] = xmpMatch[1];
  }

  return metadata;
}
