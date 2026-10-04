"use client";

/**
 * A small markdown renderer for AI output. It escapes everything first and
 * builds React elements rather than setting innerHTML, so model output can
 * never inject markup.
 *
 * Supports: headings, unordered and ordered lists, fenced and inline code,
 * bold, italic, links, blockquotes, rules, tables, and <aside> callouts.
 */

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Only allow http(s) and mailto links. Everything else stays as plain text. */
function safeHref(href) {
  const h = String(href || "").trim();
  if (/^https?:\/\//i.test(h) || /^mailto:/i.test(h)) return h;
  return null;
}

/** Inline formatting on an already-escaped string. */
function inline(escaped) {
  let out = escaped;

  // `code`
  out = out.replace(/`([^`\n]+)`/g, (_, c) => `<code>${c}</code>`);

  // [text](href)
  out = out.replace(/\[([^\]\n]*)\]\(([^)\s]+)\)/g, (m, text, href) => {
    const raw = m.replace(/&amp;/g, "&");
    const h = safeHref(href.replace(/&amp;/g, "&"));
    if (!h) return text;
    return `<a href="${escapeHtml(h)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });

  // **bold** then *italic*
  out = out.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*\w])\*([^*\n]+)\*(?![*\w])/g, "$1<em>$2</em>");

  return out;
}

function renderTableRow(line, tag) {
  const cells = line
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
  return `<tr>${cells
    .map((c) => `<${tag}>${inline(escapeHtml(c))}</${tag}>`)
    .join("")}</tr>`;
}

const isTableDivider = (l) => /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(l) && l.includes("-");

/** Leading indent of a raw line, counting a tab as four columns. */
function indentOf(line) {
  const m = String(line).match(/^[ \t]*/)[0];
  let n = 0;
  for (const ch of m) n += ch === "\t" ? 4 : 1;
  return n;
}

/**
 * Task list markers. Rendered as real disabled checkboxes so a reader can see
 * progress at a glance. `disabled` keeps it a document rather than a form, so
 * there is no state to persist and nothing to submit.
 */
function taskItem(content) {
  const m = content.match(/^\[([ xX])\]\s+(.*)$/);
  if (!m) return null;
  const done = m[1].toLowerCase() === "x";
  return `<input class="hw-md-check" type="checkbox" disabled${done ? " checked" : ""} /> ${m[2]}`;
}

/** Convert markdown to an HTML string with all raw input escaped. */
export function markdownToHtml(src) {
  if (!src) return "";

  // Pull out fenced code first so its contents are never treated as markdown.
  const fences = [];
  let text = String(src).replace(/```([\w-]*)\n?([\s\S]*?)```/g, (_, lang, body) => {
    fences.push(`<pre><code>${escapeHtml(body.replace(/\n$/, ""))}</code></pre>`);
    return `\u0000FENCE${fences.length - 1}\u0000`;
  });

  // <aside> blocks become callouts.
  const asides = [];
  text = text.replace(/<aside>([\s\S]*?)<\/aside>/gi, (_, body) => {
    asides.push(body.trim());
    return `\u0000ASIDE${asides.length - 1}\u0000`;
  });

  const lines = text.split("\n");
  const out = [];
  const stack = []; // open lists: [{ tag, depth, liOpen }]
  let para = [];
  let table = null;

  const closePara = () => {
    if (para.length) {
      out.push(`<p>${inline(escapeHtml(para.join(" ")))}</p>`);
      para = [];
    }
  };
  const closeList = () => {
    while (stack.length) {
      const top = stack[stack.length - 1];
      if (top.liOpen) out.push("</li>");
      out.push(`</${top.tag}>`);
      stack.pop();
    }
  };
  const closeTable = () => {
    if (table) {
      out.push("</tbody></table>");
      table = null;
    }
  };
  const closeAll = () => {
    closePara();
    closeList();
    closeTable();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();

    const fence = t.match(/^\u0000FENCE(\d+)\u0000$/);
    if (fence) {
      closeAll();
      out.push(fences[Number(fence[1])]);
      continue;
    }

    const aside = t.match(/^\u0000ASIDE(\d+)\u0000$/);
    if (aside) {
      closeAll();
      const body = asides[Number(aside[1])];
      out.push(
        `<blockquote><strong>Prompt</strong><br>${inline(escapeHtml(body))}</blockquote>`
      );
      continue;
    }

    if (!t) {
      closeAll();
      continue;
    }

    // table
    if (t.startsWith("|") && table === null && lines[i + 1] && isTableDivider(lines[i + 1])) {
      closeAll();
      out.push("<table><thead>");
      out.push(renderTableRow(t, "th"));
      out.push("</thead><tbody>");
      table = true;
      i++;
      continue;
    }
    if (table && t.startsWith("|")) {
      out.push(renderTableRow(t, "td"));
      continue;
    }
    if (table && !t.startsWith("|")) closeTable();

    // headings
    const h = t.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeAll();
      const level = Math.min(h[1].length, 4);
      out.push(`<h${level}>${inline(escapeHtml(h[2]))}</h${level}>`);
      continue;
    }

    // rule
    if (/^([-*_])\1{2,}$/.test(t)) {
      closeAll();
      out.push("<hr />");
      continue;
    }

    // blockquote
    if (t.startsWith(">")) {
      closeAll();
      out.push(
        `<blockquote>${inline(escapeHtml(t.replace(/^>\s?/, "")))}</blockquote>`
      );
      continue;
    }

    // lists
    const ul = t.match(/^[-*+]\s+(.*)$/);
    const ol = t.match(/^\d+[.)]\s+(.*)$/);
    if (ul || ol) {
      closePara();
      closeTable();
      const want = ul ? "ul" : "ol";
      const content = (ul || ol)[1];

      // Lists nest by indentation. The roadmap puts detail bullets under their
      // day checkbox, so the indent is what keeps them attached to the right
      // parent instead of flattening into siblings.
      const ind = indentOf(line);
      while (stack.length && stack[stack.length - 1].depth > ind) {
        const deeper = stack[stack.length - 1];
        if (deeper.liOpen) { out.push("</li>"); deeper.liOpen = false; }
        out.push(`</${deeper.tag}>`);
        stack.pop();
      }
      let top = stack[stack.length - 1];
      if (top && top.depth === ind && top.tag !== want) {
        // Same level but a different marker, so this starts a sibling list.
        if (top.liOpen) { out.push("</li>"); top.liOpen = false; }
        out.push(`</${top.tag}>`);
        stack.pop();
        top = undefined;
      }
      if (!top || top.depth < ind) {
        out.push(`<${want}>`);
        top = { tag: want, depth: ind, liOpen: false };
        stack.push(top);
      }

      const task = taskItem(content);
      // Close the previous item at this level only. A deeper list opened while
      // an item was still open becomes a child of that item, which is what
      // keeps detail bullets under their day checkbox.
      if (top.liOpen) { out.push("</li>"); top.liOpen = false; }
      if (task) {
        const box = task.slice(0, task.indexOf(">") + 1);
        const rest = task.slice(task.indexOf(">") + 2);
        out.push(`<li class="hw-md-task">${box} ${inline(escapeHtml(rest))}`);
      } else {
        out.push(`<li>${inline(escapeHtml(content))}`);
      }
      top.liOpen = true;
      continue;
    }
    closeList();

    para.push(t);
  }

  closeAll();

  // Put asides and fences back as html, keeping the surrounding text escaped.
  return out
    .join("\n")
    .replace(/\u0000ASIDE(\d+)\u0000/g, (_, n) => {
      const body = asides[Number(n)];
      return `<blockquote><strong>Prompt</strong><br>${inline(
        escapeHtml(body)
      )}</blockquote>`;
    })
    .replace(/\u0000FENCE(\d+)\u0000/g, (_, n) => fences[Number(n)]);
}

export default function Markdown({ children, className = "" }) {
  return (
    <div
      className={`hw-md ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: markdownToHtml(children) }}
    />
  );
}
