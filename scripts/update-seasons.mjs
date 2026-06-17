import { readFile, writeFile } from "node:fs/promises";

const OUTPUT_FILE = new URL("../src/data/season-calendar.json", import.meta.url);
const USER_AGENT = "Dankhunter season updater (+https://github.com/andrhagman/dankhunter)";

const calendar = JSON.parse(await readFile(OUTPUT_FILE, "utf8"));
const sourceUrls = [...new Set(calendar.sources ?? calendar.events.map((event) => event.sourceUrl))];
const previousHealth = calendar.sourceHealth ?? {};
const nextHealth = {};

for (const sourceUrl of sourceUrls) {
  nextHealth[sourceUrl] = await checkSource(sourceUrl, previousHealth[sourceUrl]);
}

const sortedEvents = [...calendar.events].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
const output = {
  ...calendar,
  updatedAt: shouldBumpUpdatedAt(calendar, sortedEvents, nextHealth)
    ? new Date().toISOString()
    : calendar.updatedAt,
  events: sortedEvents,
  sources: sourceUrls,
  sourceHealth: nextHealth
};

await writeFile(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Checked ${sourceUrls.length} season sources and wrote ${sortedEvents.length} season events.`);

async function checkSource(sourceUrl, previous) {
  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "user-agent": USER_AGENT
      },
      redirect: "follow"
    });

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      checkedAt: response.ok === previous?.ok && response.status === previous?.status ? previous.checkedAt : new Date().toISOString()
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      statusText: error instanceof Error ? error.message : "Unknown error",
      checkedAt: previous?.ok === false && previous?.status === 0 ? previous.checkedAt : new Date().toISOString()
    };
  }
}

function shouldBumpUpdatedAt(previousCalendar, nextEvents, nextSourceHealth) {
  return (
    JSON.stringify(previousCalendar.events) !== JSON.stringify(nextEvents) ||
    JSON.stringify(previousCalendar.sourceHealth ?? {}) !== JSON.stringify(nextSourceHealth)
  );
}
