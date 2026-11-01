const test = require("node:test");
const assert = require("node:assert/strict");

test("project declares the intended clan tag and source in documentation", async () => {
  const fs = require("node:fs/promises");
  const readme = await fs.readFile("README.md", "utf8");
  assert.match(readme, /#2CG8JCYCP/);
  assert.match(readme, /ClashFlex/);
});

test("probe script is present", async () => {
  const fs = require("node:fs/promises");
  const stat = await fs.stat("src/probe-clashflex.js");
  assert.ok(stat.size > 500);
});
