import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/db/pool.js';
import { loadMarkdown, parseProfilesMarkdown } from '../src/utils/markdown-parse.js';
import { emptyToNull } from '../src/utils/form.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const charactersPath = path.join(__dirname, '../data/characters.json');

function nullIfEmpty(value) {
    if (value === undefined || value === null) return null;
    if (typeof value === 'string' && value.trim() === '') return null;
    return value;
}

function filterParagraphs(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map((p) => String(p).trim()).filter((p) => p.length > 0);
}

async function seed() {
    const characters = JSON.parse(fs.readFileSync(charactersPath, 'utf8'));
    const mdProfiles = parseProfilesMarkdown(loadMarkdown());

    await pool.query('DELETE FROM profile_classes');
    await pool.query('DELETE FROM profiles');

    for (const char of characters) {
        const mdDesc = mdProfiles[char.name];
        const description = mdDesc?.length
            ? mdDesc
            : filterParagraphs(char.description);

        const fullName = nullIfEmpty(char.full_name);
        const result = await pool.query(
            `INSERT INTO profiles (
                name, full_name, gender, species, age, birthday, height, weight,
                category, snippet, image_filename, player_name, level,
                location_home, location_last, description
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
            RETURNING id`,
            [
                char.name,
                fullName === char.name ? null : fullName,
                nullIfEmpty(char.gender),
                nullIfEmpty(char.species),
                nullIfEmpty(char.age),
                nullIfEmpty(char.birthday),
                nullIfEmpty(char.height),
                nullIfEmpty(char.weight),
                char.category,
                nullIfEmpty(char.snippet),
                nullIfEmpty(char.img),
                nullIfEmpty(char.player),
                char.level ?? null,
                nullIfEmpty(char.location_home),
                nullIfEmpty(char.location_last),
                JSON.stringify(description),
            ]
        );

        const profileId = result.rows[0].id;
        if (char.classes?.length) {
            for (let i = 0; i < char.classes.length; i++) {
                const c = char.classes[i];
                await pool.query(
                    `INSERT INTO profile_classes (profile_id, class_name, subclass, level, sort_order)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [profileId, c.class, nullIfEmpty(c.subclass), c.level, i]
                );
            }
        }
    }

    console.log(`Seeded ${characters.length} profiles.`);
    await pool.end();
}

seed().catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
