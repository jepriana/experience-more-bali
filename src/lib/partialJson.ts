/**
 * Parses an *incomplete* JSON document — the prefix of an answer that is still streaming —
 * into the best-effort object so far.
 *
 *   '{"title":"Bali Liv'                 -> { title: 'Bali Liv' }
 *   '{"title":"Bali","days":[{"dayN'     -> { title: 'Bali', days: [{}] }
 *
 * How: scan once tracking open strings / objects / arrays, drop any dangling incomplete
 * token (half a key, a key without a value, a half-written number or literal, a trailing
 * comma), then append the missing closing quotes and brackets and JSON.parse the result.
 * Returns undefined when nothing usable has arrived yet.
 */
export function parsePartialJson(input: string): unknown {
  const text = input.trimStart();
  if (!text) return undefined;

  try {
    return JSON.parse(text); // complete document: fast path
  } catch {}

  try {
    return JSON.parse(repair(text));
  } catch {
    return undefined;
  }
}

const COMPLETE_BARE_TOKEN = /^(?:true|false|null|-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)$/;

type Frame ={ kind: 'object'; expect: 'key' | 'value' } | { kind: 'array' };

function repair(text: string): string {
  const stack: Frame[] = [];
  let inString = false;
  let escaped = false;
  let stringStart = -1;
  let stringIsKey = false;
  // start index of a complete key still waiting for its ':' (so it can be dropped)
  let pendingKeyStart = -1;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') {
        inString = false;
        if (stringIsKey) pendingKeyStart = stringStart;
      }
      continue;
    }

    const top = stack[stack.length - 1];
    switch (ch) {
      case '"':
        inString = true;
        stringStart = i;
        stringIsKey = top?.kind === 'object' && top.expect === 'key';
        break;
      case '{':
        stack.push({ kind: 'object', expect: 'key' });
        break;
      case '[':
        stack.push({ kind: 'array' });
        break;
      case '}':
      case ']':
        stack.pop();
        break;
      case ':':
        if (top?.kind === 'object') top.expect = 'value';
        pendingKeyStart = -1;
        break;
      case ',':
        if (top?.kind === 'object') top.expect = 'key';
        break;
    }
  }

  let out = text;

  if (inString) {
    if (stringIsKey) {
      out = out.slice(0, stringStart); // half a key: drop it
    } else {
      if (escaped) out = out.slice(0, -1); // a lone trailing backslash can't be closed
      out = dropBrokenUnicodeEscape(out) + '"';
    }
  } else if (pendingKeyStart >= 0) {
    out = out.slice(0, pendingKeyStart); // complete key but no ':' yet: drop it
  }

  // Drop dangling tokens at the end until the tail is something JSON can close.
  for (let guard = 0; guard < 8; guard++) {
    const trimmed = out.replace(/\s+$/, '');
    // a bare (unquoted) token at the very end: a number or true/false/null, possibly half-written
    const bareTail = trimmed.match(/[^\s,:[\]{}"]+$/)?.[0] ?? '';
    if (trimmed.endsWith(',')) {
      out = trimmed.slice(0, -1);
    } else if (trimmed.endsWith(':')) {
      out = trimmed + 'null'; // key with no value yet
    } else if (bareTail && !COMPLETE_BARE_TOKEN.test(bareTail)) {
      out = trimmed.slice(0, -bareTail.length); // e.g. "tru", "1.", "-"
    } else {
      out = trimmed;
      break;
    }
  }

  // Close whatever is still open, innermost first.
  for (let i = stack.length - 1; i >= 0; i--) {
    out += stack[i].kind === 'object' ? '}' : ']';
  }
  return out;
}

/** A string cut inside "é" would not parse once closed; drop the partial escape. */
function dropBrokenUnicodeEscape(s: string): string {
  return s.replace(/\\u[0-9a-fA-F]{0,3}$/, '');
}

/**
 * Path to the value currently being written, e.g. ['days', 2, 'familyMission'].
 * JSON.parse keeps keys in the order they appeared, and the model writes in order,
 * so the last key at each level is the one in progress.
 */
export function lastPathOf(value: unknown): (string | number)[] {
  const path: (string | number)[] = [];
  let node = value;
  for (let depth = 0; depth < 12; depth++) {
    if (Array.isArray(node)) {
      if (node.length === 0) break;
      path.push(node.length - 1);
      node = node[node.length - 1];
    } else if (node && typeof node === 'object') {
      const keys = Object.keys(node);
      if (keys.length === 0) break;
      const key = keys[keys.length - 1];
      path.push(key);
      node = (node as Record<string, unknown>)[key];
    } else {
      break;
    }
  }
  return path;
}
