"use client";

import Markdown from "./Markdown";
import Accordion from "./Accordion";

/**
 * Renders a roadmap as one accordion row per phase.
 *
 * The canonical shape (see AGENTS.md) is `## Phase N - Title`, a `**Days X-Y**`
 * span, then a phase checkbox and one checkbox per day block. Collapsed, a row
 * shows the phase title, its day span and how much of it is ticked. Expanded,
 * it shows the checkboxes and the detail bullets, which stay plain reference
 * text.
 *
 * Prose sections such as "Target" have no checkboxes and are not phases, so they
 * render as prose: those before the first phase above the accordion, anything
 * after it below.
 */

/** A field label sits alone on its line, so bold text in a sentence is not a field. */
const HEADING = /^##[ \t]+(.*)$/;
const DAY_SPAN = /^\*\*[ \t]*(Days?[^*]*?)[ \t]*\*\*:?[ \t]*$/;
const CHECKBOX = /^[ \t]*[-*+][ \t]+\[[ xX]\]/;
const PHASE = /^phase\b/i;
const PHASE_NUMBER = /^phase[ \t]+(\d+)/i;
const PHASE_LABEL = /^phase[ \t]+\d+[ \t]*[-.:]?[ \t]*/i;

/** Collapse markdown to plain text for the collapsed row. */
function plain(md) {
  return String(md || "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parse(source) {
  const lines = String(source || "").split("\n");
  const preamble = [];
  const sections = [];
  let current = null;

  for (const line of lines) {
    const heading = line.match(HEADING);
    if (heading) {
      if (current) sections.push(current);
      current = { heading: heading[1].trim(), lines: [] };
      continue;
    }
    if (current) current.lines.push(line);
    else preamble.push(line);
  }
  if (current) sections.push(current);

  const before = [];
  const after = [];
  const items = [];

  for (const section of sections) {
    const spanLine = section.lines.find((l) => DAY_SPAN.test(l.trim()));
    const body = section.lines.filter(
      (l) => !spanLine || l.trim() !== spanLine.trim()
    );
    const bodyText = body.join("\n").trim();
    const isPhase = PHASE.test(section.heading) || CHECKBOX.test(bodyText);

    if (!isPhase) {
      const block = `## ${section.heading}\n\n${bodyText}`.trim();
      (items.length ? after : before).push(block);
      continue;
    }

    // Day blocks are the trackable work. The phase checkbox is separate and is
    // not counted, otherwise "3 of 9 days" would double count the phase.
    const days = body.filter((l) => CHECKBOX.test(l) && !/phase complete/i.test(l));
    const done = days.filter((l) => /\[[xX]\]/.test(l)).length;

    items.push({
      key: section.heading,
      num: (section.heading.match(PHASE_NUMBER) || [])[1] || "",
      title: section.heading.replace(PHASE_LABEL, "") || section.heading,
      subtitle: spanLine ? plain(spanLine) : "",
      preview: days.length ? `${done} of ${days.length} days done` : "",
      body: bodyText,
    });
  }

  // The document title is already the tab label, so only keep a real intro.
  // Drop boilerplate intro lines that are not a short overview.
  const filtered = preamble
    .join("\n")
    .replace(/^#.*$/m, "")
    .split("\n")
    .filter((l) => {
      const t = l.trim();
      if (!t) return false;
      if (/^posting:/i.test(t)) return false;
      if (/warmest door/i.test(t)) return false;
      if (/progress is tracked/i.test(t)) return false;
      if (t.startsWith("`")) return false;
      return true;
    })
    .join("\n")
    .trim();
  let intro = filtered;
  intro = intro.replace(/\n.*update it in place.*reference, not tracking.*$/im, "");
  intro = intro.replace(/^.*update it in place.*reference, not tracking.*\n?/im, "");
  intro = intro.replace(/Progress is tracked[\s\S]*$/im, "");
  intro = intro.replace(/\n\*\*Warmest door:.*$/im, "");
  intro = intro.replace(/\n\*\*Posting:.*$/im, "");
  intro = intro.replace(/^\*\*Posting:.*$/im, "");
  intro = intro.replace(/\n\*\*Warmest door:.*$/im, "");
  const introText = intro.trim();

  return {
    introText,
    items,
    before,
    after,
  };
}

export default function Roadmap({ source }) {
  const { introText, items, before, after } = parse(source);

  if (!items.length) {
    return (
      <Markdown>
        {String(source || "").trim() || "No roadmap saved yet."}
      </Markdown>
    );
  }

  return (
    <>
      {introText && (
        <div className="hw-acc-intro">
          <Markdown>{introText}</Markdown>
        </div>
      )}

      {before.map((block) => (
        <div className="hw-acc-note" key={`before-${block.slice(0, 40)}`}>
          <Markdown>{block}</Markdown>
        </div>
      ))}

      <Accordion
        items={items.map((item) => ({
          ...item,
          content: <Markdown>{item.body}</Markdown>,
        }))}
        footer={
          after.length ? (
            <>
              {after.map((block) => (
                <div className="hw-acc-note" key={`after-${block.slice(0, 40)}`}>
                  <Markdown>{block}</Markdown>
                </div>
              ))}
            </>
          ) : null
        }
      />
    </>
  );
}