import fs from "node:fs";
import path from "node:path";

// Load the real markdownToHtml from the component by dropping the JSX part,
// which is the only part that needs the React runtime.
const src = fs.readFileSync(
  path.join(process.cwd(), "components/Markdown.jsx"),
  "utf8"
);
const pure = src.slice(0, src.indexOf("export default function Markdown"));
const mod = await import(
  "data:text/javascript;base64," +
  Buffer.from(pure).toString("base64")
);
const md = mod.markdownToHtml;

let failures = 0;

console.log("\n--- xss / escaping ---");
{
  const out = md("Hello <script>alert(1)</script>");
  const ok = !/<script/i.test(out) && out.includes("&lt;script&gt;");
  console.log(`  ${ok ? "ok  " : "FAIL"} script tag escaped`);
  if (!ok) failures++;
}
{
  const out = md('<img src=x onerror="alert(1)">');
  const ok = !/<img/i.test(out) && out.includes("&lt;img");
  console.log(`  ${ok ? "ok  " : "FAIL"} img onerror escaped`);
  if (!ok) failures++;
}
{
  const out = md("[click](javascript:alert(1))");
  const ok = !/href="javascript/i.test(out);
  console.log(`  ${ok ? "ok  " : "FAIL"} javascript: href blocked`);
  if (!ok) failures++;
}
{
  const out = md("[ok](https://example.com)");
  const ok = /href="https:\/\/example\.com"/.test(out);
  console.log(`  ${ok ? "ok  " : "FAIL"} https link allowed`);
  if (!ok) failures++;
}
{
  const out = md("[x](https://e.com/\" onmouseover=\"alert(1))");
  // The URL contains a space so the link regex refuses it and it stays plain,
  // escaped text. The real property: no raw attribute can be smuggled in.
  const rawAttrBreakout = /onmouseover="alert/.test(out);
  const ok = !/<a\b/.test(out) && !rawAttrBreakout;
  console.log(`  ${ok ? "ok  " : "FAIL"} quote breakout in href blocked`);
  if (!ok) failures++;
}
{
  const out = md("**bold** and `code` and *em*");
  const ok =
    out.includes("<strong>bold</strong>") &&
    out.includes("<code>code</code>") &&
    out.includes("<em>em</em>");
  console.log(`  ${ok ? "ok  " : "FAIL"} inline bold/code/em`);
  if (!ok) failures++;
}

console.log("\n--- structure ---");
{
  const out = md("# Title\n\nSome text.\n\n- a\n- b\n");
  const ok =
    out.includes("<h1>Title</h1>") &&
    out.includes("<ul>") &&
    out.includes("<li>a</li>");
  console.log(`  ${ok ? "ok  " : "FAIL"} headings and lists`);
  if (!ok) failures++;
}
{
  const out = md("```js\nconst a = 1 < 2;\n```");
  const ok =
    out.includes("<pre><code>") && out.includes("1 &lt; 2") && !out.includes("const a = 1 < 2;");
  console.log(`  ${ok ? "ok  " : "FAIL"} fenced code escaped`);
  if (!ok) failures++;
}
{
  const out = md("| A | B |\n|---|---|\n| 1 | 2 |");
  const ok =
    out.includes("<table>") && out.includes("<th>A</th>") && out.includes("<td>1</td>");
  console.log(`  ${ok ? "ok  " : "FAIL"} table`);
  if (!ok) failures++;
}
{
  const out = md("<aside>\nPaste this into the chat\n</aside>");
  const ok = out.includes("<blockquote>") && out.includes("Paste this into the chat");
  console.log(`  ${ok ? "ok  " : "FAIL"} aside becomes a callout`);
  if (!ok) failures++;
}
{
  const out = md("> quoted line");
  const ok = out.includes("<blockquote>quoted line</blockquote>");
  console.log(`  ${ok ? "ok  " : "FAIL"} blockquote`);
  if (!ok) failures++;
}
{
  const out = md("---");
  const ok = out.includes("<hr />");
  console.log(`  ${ok ? "ok  " : "FAIL"} horizontal rule`);
  if (!ok) failures++;
}

console.log("\n--- edge cases ---");
{
  const out = md("");
  const ok = out === "";
  console.log(`  ${ok ? "ok  " : "FAIL"} empty input`);
  if (!ok) failures++;
}
{
  const out = md(null);
  const ok = out === "";
  console.log(`  ${ok ? "ok  " : "FAIL"} null input`);
  if (!ok) failures++;
}
{
  const out = md("1. first\n2. second");
  const ok = out.includes("<ol>") && out.includes("<li>first</li>");
  console.log(`  ${ok ? "ok  " : "FAIL"} ordered list`);
  if (!ok) failures++;
}
{
  const out = md("| A | B |\n|---|---|\n| 1 | 2 |\n\ntext after");
  const ok = out.includes("</table>") && out.includes("text after");
  console.log(`  ${ok ? "ok  " : "FAIL"} table closes before trailing text`);
  if (!ok) failures++;
}

console.log(
  failures ? `\n${failures} FAILURE(S)\n` : "\nAll markdown checks passed\n"
);
process.exit(failures ? 1 : 0);
