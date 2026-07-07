import pool from '../src/db/pool.js';
import { loadMarkdown, parseTravelogueMarkdown } from '../src/utils/markdown-parse.js';

async function seed() {
    const sessions = parseTravelogueMarkdown(loadMarkdown());

    await pool.query('DELETE FROM travelogue_sections');
    await pool.query('DELETE FROM travelogue_sessions');

    for (const session of sessions) {
        const sessionResult = await pool.query(
            `INSERT INTO travelogue_sessions (real_session_date, session_title, sort_order)
             VALUES ($1, $2, $3) RETURNING id`,
            [session.real_session_date, session.session_title, session.sort_order]
        );
        const sessionId = sessionResult.rows[0].id;

        for (const section of session.sections) {
            await pool.query(
                `INSERT INTO travelogue_sections (session_id, in_game_date, paragraphs, sort_order)
                 VALUES ($1, $2, $3, $4)`,
                [
                    sessionId,
                    section.in_game_date,
                    JSON.stringify(section.paragraphs),
                    section.sort_order,
                ]
            );
        }
    }

    const sectionCount = sessions.reduce((n, s) => n + s.sections.length, 0);
    console.log(`Seeded ${sessions.length} sessions and ${sectionCount} sections.`);
    await pool.end();
}

seed().catch((err) => {
    console.error('Import failed:', err.message);
    process.exit(1);
});
