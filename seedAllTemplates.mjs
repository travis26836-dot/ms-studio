/**
 * Combined Template Seeder
 * Imports all template files and inserts them into the database.
 * Run: node seedAllTemplates.mjs
 */
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import template modules
import { menuTemplates } from './seedNewTemplates.mjs';
// The invitationTemplates export is truncated, so we'll extract the complete ones manually
import { invitationTemplates } from './seedNewTemplates.mjs';
import { moreInvitations } from './seedInvitations.mjs';
import { certificateTemplates } from './seedCertificates.mjs';
import { moreCertificates } from './seedMoreCerts.mjs';

async function seed() {
  const sql = neon(process.env.DATABASE_URL);
  
  // Collect all templates, filtering out any that might be incomplete
  const allTemplates = [];
  
  // Menu templates (34 from seedNewTemplates)
  if (menuTemplates) {
    for (const t of menuTemplates) {
      if (t && t.name && t.canvasData && t.canvasData.objects) {
        allTemplates.push(t);
      }
    }
  }
  console.log(`Menu templates: ${allTemplates.length}`);
  
  // Invitation templates from original file (may be truncated)
  let invCount = 0;
  if (invitationTemplates) {
    for (const t of invitationTemplates) {
      if (t && t.name && t.canvasData && t.canvasData.objects && t.canvasData.objects.length > 0) {
        allTemplates.push(t);
        invCount++;
      }
    }
  }
  console.log(`Invitation templates (original): ${invCount}`);
  
  // More invitations
  let moreInvCount = 0;
  if (moreInvitations) {
    for (const t of moreInvitations) {
      if (t && t.name && t.canvasData && t.canvasData.objects) {
        allTemplates.push(t);
        moreInvCount++;
      }
    }
  }
  console.log(`Invitation templates (additional): ${moreInvCount}`);
  
  // Certificate templates
  let certCount = 0;
  if (certificateTemplates) {
    for (const t of certificateTemplates) {
      if (t && t.name && t.canvasData && t.canvasData.objects) {
        allTemplates.push(t);
        certCount++;
      }
    }
  }
  console.log(`Certificate templates: ${certCount}`);
  
  // More certificates
  let moreCertCount = 0;
  if (moreCertificates) {
    for (const t of moreCertificates) {
      if (t && t.name && t.canvasData && t.canvasData.objects) {
        allTemplates.push(t);
        moreCertCount++;
      }
    }
  }
  console.log(`Certificate templates (additional): ${moreCertCount}`);
  
  console.log(`\nTotal templates to insert: ${allTemplates.length}`);
  
  // Insert all templates
  let inserted = 0;
  let skipped = 0;
  
  for (const t of allTemplates) {
    try {
      const canvasJson = JSON.stringify(t.canvasData);
      const tagsJson = JSON.stringify(t.tags || []);
      
      // Check if template already exists by name
      const existing = await sql`SELECT id FROM templates WHERE name = ${t.name}`;
      
      if (existing.length > 0) {
        // Update existing template
        await sql`
          UPDATE templates
          SET description = ${t.description},
              category = ${t.category},
              subcategory = ${t.subcategory || null},
              "canvasWidth" = ${t.canvasWidth},
              "canvasHeight" = ${t.canvasHeight},
              "canvasData" = ${canvasJson},
              tags = ${tagsJson}
          WHERE name = ${t.name}
        `;
        skipped++;
      } else {
        // Insert new template
        await sql`
          INSERT INTO templates (name, description, category, subcategory, "canvasWidth", "canvasHeight", "canvasData", tags, "createdAt")
          VALUES (
            ${t.name}, ${t.description}, ${t.category}, ${t.subcategory || null},
            ${t.canvasWidth}, ${t.canvasHeight}, ${canvasJson}, ${tagsJson}, NOW()
          )
        `;
        inserted++;
      }
    } catch (err) {
      console.error(`Error inserting "${t.name}":`, err.message);
    }
  }
  
  console.log(`\nDone! Inserted: ${inserted}, Updated: ${skipped}`);
  
  // Show final counts by category
  const counts = await sql`SELECT category, COUNT(*) as count FROM templates GROUP BY category ORDER BY category`;
  console.log('\nTemplates by category:');
  for (const row of counts) {
    console.log(`  ${row.category}: ${row.count}`);
  }
  
  const total = await sql`SELECT COUNT(*) as total FROM templates`;
  console.log(`\nTotal templates in database: ${total[0].total}`);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
