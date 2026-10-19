const API_URL = `${process.env.VITE_API_ENV ?? "http://localhost:8080"}/feedback-pulse/ingest`;

const SOURCES = ['Discord', 'Twitter', 'Email', 'GitHub Issue', 'Support Ticket', 'Community Forum'];
const AUTHORS = ['dev_jane', '@startup_founder', 'enterprise_corp', 'bug_hunter_x', '@darkmode_fan', 'client_882', 'sre_team'];
const TEMPLATES = [
    "The PDF export function crashes when selecting 'Last 30 Days'.",
    "Mobile view is squashed on iPhone Mini.",
    "CRITICAL: Admin users getting 403 Forbidden errors.",
    "Typo in settings: 'Notifcations' is missing an 'i'.",
    "Please add a toggle to sync theme with system settings.",
    "We were charged twice for this month's subscription.",
    "API latency is huge today (2000ms+).",
    "Cannot invite new team members via email link.",
    "Documentation for v2 API is returning 404.",
    "Dark mode flashes white on page reload."
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 1. Generate 20 items (or change to 100)
const items = [];
for (let i = 0; i < 20; i++) {
    const timeOffset = getRandomInt(0, 7 * 24 * 60 * 60 * 1000);
    items.push({
        source: SOURCES[getRandomInt(0, SOURCES.length - 1)],
        author: AUTHORS[getRandomInt(0, AUTHORS.length - 1)],
        content: `${TEMPLATES[getRandomInt(0, TEMPLATES.length - 1)]} [Ref: ${Math.floor(Math.random() * 9999)}]`,
        timestamp: new Date(Date.now() - timeOffset).toISOString()
    });
}

// 2. Upload Loop (Simulating the Playground)
async function seed() {
    console.log(`🚀 Starting seed of ${items.length} items to ${API_URL}...`);

    let success = 0;
    for (const [index, item] of items.entries()) {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });

            if (res.ok) {
                success++;
                process.stdout.write(`\r✅ Uploaded ${success}/${items.length}`);
            } else {
                console.error(`\n❌ Failed item ${index}:`, await res.text());
            }
        } catch (err) {
            console.error(`\n❌ Error on item ${index}:`, err.message);
        }
    }
    console.log("\n✨ Seeding complete!");
}

seed();