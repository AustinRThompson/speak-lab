const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const inputDir = "_publish/logs";
const outputFile = "docs/data/project-updates.json";

function getMarkdownFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }

  return results;
}

function stripWikiLinks(value) {
  if (typeof value !== "string") return value;
  return value.replace(/\[\[(.*?)\]\]/g, "$1");
}

function cleanTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.map(tag => String(tag).replace(/^#/, ""));
}

const files = getMarkdownFiles(inputDir);

const updates = files.map((file) => {
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(raw);
  const d = parsed.data;

  const firstProject = Array.isArray(d.projects) && d.projects.length > 0
    ? d.projects[0]
    : null;

  const body = parsed.content.trim();

  return {
    date: d.dateCreated ?? null,
    project: stripWikiLinks(firstProject),
    highlight: d.highlight ?? false,
    type: d.type ?? null,
    summary: d.note ?? (body ? body.split("\n")[0] : null),
    hours_to_date: d.hours_to_date ?? null,
    tags: cleanTags(d.tags),
    body: body,
    filename: path.basename(file)
  };
});

updates.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(updates, null, 2));

console.log(`Built ${updates.length} updates into ${outputFile}`);
