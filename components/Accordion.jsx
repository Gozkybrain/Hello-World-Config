"use client";

import { useState } from "react";

/**
 * Single-open accordion shared by the roadmap and proof-of-work tabs.
 *
 * One item open at a time: opening a row closes whichever row was open. The
 * caller supplies the parsed structure, so this only owns the open/closed state
 * and the accessible wiring.
 *
 * Each item: { key, num, title, subtitle, preview, content }
 */
export default function Accordion({ items, intro, footer }) {
  const [open, setOpen] = useState(-1);

  if (!items.length) return null;

  return (
    <div className="hw-acc">
      {intro}

      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `acc-panel-${i}`;

        return (
          <section
            className={`hw-acc-item${isOpen ? " hw-acc-item--on" : ""}`}
            key={item.key}
          >
            <h3 className="hw-acc-head">
              <button
                type="button"
                className="hw-acc-btn"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span className="hw-acc-title">
                  <span className="hw-acc-name">{item.title}</span>
                </span>
                {item.subtitle && (
                  <span className="hw-acc-span">{item.subtitle}</span>
                )}
                {item.preview && (
                  <span className="hw-acc-desc">{item.preview}</span>
                )}

                <svg
                  className="hw-acc-chev"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6 9 6 6 6-6"
                  />
                </svg>
              </button>
            </h3>

            <div className="hw-acc-body" id={panelId} hidden={!isOpen}>
              <div className="hw-acc-panel">{item.content}</div>
            </div>
          </section>
        );
      })}

      {footer}
    </div>
  );
}