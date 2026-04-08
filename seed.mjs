import mysql from "mysql2/promise";
import { templates as templateData } from "./seedTemplates.mjs";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function seed() {
  const conn = await mysql.createConnection(DATABASE_URL);

  console.log("Seeding templates...");
  for (const t of templateData) {
    try {
      await conn.execute(
        `INSERT INTO templates (name, description, category, subcategory, canvasWidth, canvasHeight, canvasData, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)`,
        [
          t.name,
          t.description || null,
          t.category,
          t.subcategory || null,
          t.canvasWidth,
          t.canvasHeight,
          JSON.stringify(t.canvasData),
          JSON.stringify(t.tags || []),
        ]
      );
      console.log(`  ✓ ${t.name}`);
    } catch (e) {
      console.error(`  ✗ ${t.name}: ${e.message}`);
    }
  }

  const sampleAssets = [
    { name: "Circle", type: "shape", category: "basic", url: "", tags: ["circle", "shape", "basic"] },
    { name: "Rectangle", type: "shape", category: "basic", url: "", tags: ["rectangle", "shape", "basic"] },
    { name: "Triangle", type: "shape", category: "basic", url: "", tags: ["triangle", "shape", "basic"] },
    { name: "Star", type: "shape", category: "basic", url: "", tags: ["star", "shape", "basic"] },
    { name: "Arrow Right", type: "element", category: "arrows", url: "", tags: ["arrow", "right", "element"] },
    { name: "Arrow Left", type: "element", category: "arrows", url: "", tags: ["arrow", "left", "element"] },
    { name: "Heart", type: "shape", category: "symbols", url: "", tags: ["heart", "love", "symbol"] },
    { name: "Diamond", type: "shape", category: "basic", url: "", tags: ["diamond", "shape", "basic"] },
    { name: "Hexagon", type: "shape", category: "basic", url: "", tags: ["hexagon", "shape", "basic"] },
    { name: "Pentagon", type: "shape", category: "basic", url: "", tags: ["pentagon", "shape", "basic"] },
    { name: "Line Divider", type: "element", category: "dividers", url: "", tags: ["line", "divider", "element"] },
    { name: "Dotted Divider", type: "element", category: "dividers", url: "", tags: ["dotted", "divider", "element"] },
    { name: "Wavy Divider", type: "element", category: "dividers", url: "", tags: ["wavy", "divider", "element"] },
    { name: "Badge Circle", type: "element", category: "badges", url: "", tags: ["badge", "circle", "element"] },
    { name: "Banner Ribbon", type: "element", category: "badges", url: "", tags: ["banner", "ribbon", "element"] },
    { name: "Speech Bubble", type: "element", category: "callouts", url: "", tags: ["speech", "bubble", "callout"] },
    { name: "Quote Mark", type: "element", category: "typography", url: "", tags: ["quote", "mark", "typography"] },
    { name: "Bracket Left", type: "element", category: "typography", url: "", tags: ["bracket", "left", "typography"] },
    { name: "Frame Simple", type: "element", category: "frames", url: "", tags: ["frame", "simple", "border"] },
    { name: "Frame Ornate", type: "element", category: "frames", url: "", tags: ["frame", "ornate", "decorative"] },
  ];

  console.log("\nSeeding assets...");
  for (const a of sampleAssets) {
    try {
      await conn.execute(
        `INSERT INTO assets (name, type, category, url, tags) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)`,
        [a.name, a.type, a.category, a.url, JSON.stringify(a.tags)]
      );
      console.log(`  ✓ ${a.name}`);
    } catch (e) {
      console.error(`  ✗ ${a.name}: ${e.message}`);
    }
  }

  console.log("\nSeeding complete!");
  await conn.end();
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
