// Reference — fs with async/await, operations in guaranteed order.
//
// KEY IDEA: every fs/promises call returns a Promise. If you don't await it,
// the next line runs immediately and the operations race (read might happen
// before the write finished). These steps DEPEND on each other, so they must
// be awaited one after another — sequential, not parallel.

const fs = require("fs/promises");

// All the work lives inside ONE async function, because `await` is only
// allowed inside `async`.
async function run() {
  // 1. write the first line (overwrites the file if it exists)
  //    \n so the appended line later lands on its own line
  await fs.writeFile("data.txt", "PR-001 submitted\n");

  // 2. read it back — await, so we get the STRING (not a pending Promise)
  //    "utf8" = give me text; without it we'd get raw bytes (a Buffer)
  const first = await fs.readFile("data.txt", "utf8");
  process.stdout.write(first); // already ends with \n, so no extra newline

  // 3. append a second line — only starts after step 2 finished
  await fs.appendFile("data.txt", "PR-002 submitted\n");

  // 4. read the whole file again — now it has both lines
  const both = await fs.readFile("data.txt", "utf8");
  process.stdout.write(both);
}

run();

// Expected output:
//   PR-001 submitted
//   PR-001 submitted
//   PR-002 submitted
