import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_PATH = path.join(__dirname, '../../data/lucys-travelogue.md');

/** Clean Google Docs export escapes from raw markdown text. */
export function cleanMarkdownText(text) {
    let result = text;
    result = result.replace(/\\</g, '<').replace(/\\>/g, '>');
    result = result.replace(/\\!/g, '!');
    result = result.replace(/\\-/g, '-');
    result = result.replace(/\\\[/g, '[').replace(/\\\]/g, ']');
    result = result.replace(
        /<They can be quite annoyi.*?LONGLEGS.*?>/s,
        '<They can be quite annoying. F*** YOU LONGLEGS!!>'
    );
    return result;
}

export function loadMarkdown() {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return cleanMarkdownText(raw);
}

export function splitParagraphs(body) {
    return body
        .split(/\n\s*\n/)
        .map((p) => p.replace(/\n/g, ' ').trim())
        .filter((p) => p.length > 0);
}

/** Parse travelogue portion into sessions with nested sections. */
export function parseTravelogueMarkdown(content) {
    const profilesIdx = content.indexOf('# Profiles');
    const travelogueText = profilesIdx >= 0 ? content.slice(0, profilesIdx) : content;
    const lines = travelogueText.split('\n');

    const sessions = [];
    let currentSession = null;
    let currentSection = null;
    let bodyLines = [];

    function flushSection() {
        if (!currentSession || !currentSection) return;
        const body = bodyLines.join('\n').trim();
        currentSection.paragraphs = splitParagraphs(body);
        if (currentSection.paragraphs.length > 0 || currentSection.in_game_date) {
            currentSession.sections.push(currentSection);
        }
        bodyLines = [];
        currentSection = null;
    }

    function flushSession() {
        flushSection();
        if (currentSession && currentSession.sections.length > 0) {
            sessions.push(currentSession);
        }
        currentSession = null;
    }

    function ensureSection() {
        if (!currentSection) {
            currentSection = {
                in_game_date: null,
                paragraphs: [],
                sort_order: currentSession.sections.length,
            };
        }
    }

    for (const line of lines) {
        const sessionMatch = line.match(/^# \*\*(.+)\*\*\s*$/);
        const dateMatch = line.match(/^## \*\*(.+)\*\*\s*$/);

        if (line.trim() === '# Travelogue') continue;

        if (sessionMatch) {
            flushSession();
            const inner = sessionMatch[1].trim();
            if (inner === 'Prologue') {
                currentSession = {
                    real_session_date: null,
                    session_title: 'Prologue',
                    sort_order: sessions.length,
                    sections: [],
                };
            } else {
                const dated = inner.match(/^(\d+\.\d+\.\d+)\s*-\s*"([^"]+)"$/);
                if (dated) {
                    const [, mdy, title] = dated;
                    const [m, d, y] = mdy.split('.').map(Number);
                    const year = y < 100 ? y + 2000 : y;
                    currentSession = {
                        real_session_date: `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                        session_title: title,
                        sort_order: sessions.length,
                        sections: [],
                    };
                }
            }
            bodyLines = [];
            continue;
        }

        if (dateMatch && currentSession) {
            flushSection();
            currentSection = {
                in_game_date: dateMatch[1].trim(),
                paragraphs: [],
                sort_order: currentSession.sections.length,
            };
            bodyLines = [];
            continue;
        }

        if (currentSession) {
            ensureSection();
            bodyLines.push(line);
        }
    }

    flushSession();
    return sessions;
}

/** Parse Profiles section into name → paragraphs map. */
export function parseProfilesMarkdown(content) {
    const profilesIdx = content.indexOf('# Profiles');
    if (profilesIdx < 0) return {};

    const profilesText = content.slice(profilesIdx);
    const chunks = profilesText.split(/^# \{ (.+?) \}\s*$/m);
    const result = {};

    for (let i = 1; i < chunks.length; i += 2) {
        const name = chunks[i].trim();
        const body = chunks[i + 1] || '';
        if (name === 'People and Stuff') continue;
        result[name] = splitParagraphs(body.trim());
    }

    return result;
}
