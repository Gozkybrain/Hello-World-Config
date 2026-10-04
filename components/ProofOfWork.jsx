"use client";

import { useState } from "react";
import Markdown from "./Markdown";
import Accordion from "./Accordion";

/**
 * Renders proof-of-work as a single-open accordion: one row per project showing
 * the title and the description, expanding to the rest of the fields.
 *
 * The markdown file is the source of truth and keeps the canonical field order
 * (Description, What it builds, What it solves, Stack, Duration, Extra), so this
 * parses that shape instead of taking a second structured input. A section with
 * no fields is not a project, which is what keeps a trailing note such as
 * "What to build first" out of the accordion.
 */

/** A field label sits alone on its line, so bold text in a sentence is not a field. */
const FIELD = /^\*\*([^*]+)\*\*:?[ \t]*$/;
const HEADING = /^##[ \t]+(.*)$/;
const NUMBERED = /^(\d+)[.)][ \t]*(.*)$/;

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
  const sections = [];
  const preamble = [];
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

  const projects = [];
  const notes = [];

  for (const section of sections) {
    const fields = [];
    let open = null;
    for (const line of section.lines) {
      const field = line.match(FIELD);
      if (field) {
        open = { label: field[1].trim(), body: [] };
        fields.push(open);
        continue;
      }
      if (open) open.body.push(line);
    }

    if (!fields.length) {
      const body = section.lines.join("\n").trim();
      if (body) notes.push(`## ${section.heading}\n\n${body}`);
      continue;
    }

    const numbered = section.heading.match(NUMBERED);
    projects.push({
      num: numbered ? numbered[1] : "",
      title: numbered ? numbered[2] : section.heading,
      fields,
    });
  }

  // The document title is already the tab label, so only keep a real intro.
  const intro = preamble
    .join("\n")
    .replace(/^#.*$/m, "")
    .trim();

  return { intro, projects, notes };
}

export default function ProofOfWork({ source }) {
  const { intro, projects, notes } = parse(source);

  if (!projects.length) {
    return (
      <Markdown>
        {String(source || "").trim() || "No project ideas saved yet."}
      </Markdown>
    );
  }

  const items = projects.map((project) => {
    const description =
      project.fields.find((f) => /description/i.test(f.label)) || null;
    const rest = project.fields.filter((f) => f !== description);
    const preview = description ? plain(description.body.join("\n")) : "";

    return {
      key: `${project.num}-${project.title}`,
      num: project.num,
      title: project.title,
      preview,
      content: (
        <div>
          {rest.map((field) => (
            <div className="hw-acc-field" key={field.label}>
              <p className="hw-acc-label">{field.label}</p>
              <Markdown>{field.body.join("\n").trim()}</Markdown>
            </div>
          ))}
        </div>
      ),
    };
  });

  return (
    <Accordion
      items={items}
      intro={intro ? <Markdown className="hw-acc-intro">{intro}</Markdown> : null}
      footer={
        notes.length ? (
          <>
            {notes.map((note) => (
              <div className="hw-acc-note" key={note.slice(0, 40)}>
                <Markdown>{note}</Markdown>
              </div>
            ))}
          </>
        ) : null
      }
    />
  );
}
