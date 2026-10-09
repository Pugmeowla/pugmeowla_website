// Tiny build-time syntax highlighting for JSON and Minecraft commands. Returns escaped HTML.
import { escapeHtml } from './util.mjs';

function json(text) {
  const pattern = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|(\/\/[^\n]*)/g;
  let out = '', last = 0;
  for (const m of text.matchAll(pattern)) {
    out += escapeHtml(text.slice(last, m.index));
    if (m[1]) out += m[2] ? `<span class="t-key">${escapeHtml(m[1])}</span>${escapeHtml(m[2])}` : `<span class="t-str">${escapeHtml(m[1])}</span>`;
    else if (m[3]) out += `<span class="t-num">${m[3]}</span>`;
    else if (m[4]) out += `<span class="t-bool">${m[4]}</span>`;
    else out += `<span class="t-comment">${escapeHtml(m[5])}</span>`;
    last = m.index + m[0].length;
  }
  return out + escapeHtml(text.slice(last));
}

function command(text) {
  return text.split('\n').map((line) => {
    if (/^\s*#/.test(line)) return `<span class="t-comment">${escapeHtml(line)}</span>`;
    let first = true;
    return line.replace(/(<[^>]+>)|(\[[^\]]+\])|(@[aeprs](?:\[[^\]]*\])?)|("[^"]*")|(-?\b\d+(?:\.\d+)?\b)|(\S+)|(\s+)/g,
      (token, arg, optional, selector, string, number, word, space) => {
        if (space) return space;
        if (arg) return `<span class="t-arg">${escapeHtml(arg)}</span>`;
        if (optional) return `<span class="t-opt">${escapeHtml(optional)}</span>`;
        if (selector) return `<span class="t-sel">${escapeHtml(selector)}</span>`;
        if (string) return `<span class="t-str">${escapeHtml(string)}</span>`;
        if (number && !first) return `<span class="t-num">${number}</span>`;
        if (first) { first = false; return `<span class="t-cmd">${escapeHtml(token)}</span>`; }
        return `<span class="t-lit">${escapeHtml(word || number)}</span>`;
      });
  }).join('\n');
}

export function highlight(text, lang) {
  if (lang === 'json') return json(text);
  if (lang === 'command' || lang === 'mcfunction') return command(text);
  return escapeHtml(text);
}
