/** Convert blank strings to null for optional DB fields. */
export function emptyToNull(value) {
    if (value === undefined || value === null) return null;
    const trimmed = String(value).trim();
    return trimmed === '' ? null : trimmed;
}

/** Parse textarea content: one paragraph per blank line. */
export function paragraphsFromText(text) {
    if (!text || !String(text).trim()) return [];
    return String(text)
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
}

/** Serialize paragraph array back to textarea content. */
export function textFromParagraphs(paragraphs) {
    if (!Array.isArray(paragraphs) || paragraphs.length === 0) return '';
    return paragraphs.join('\n\n');
}

export function parseIntOrNull(value) {
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? null : n;
}

/** Parse M.D.YY real session date → ISO date string for PostgreSQL. */
export function parseRealSessionDate(mdy) {
    const parts = mdy.split('.');
    if (parts.length !== 3) return null;
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    if (Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(year)) return null;
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
}

/** Format session for display in admin lists. */
export function formatSessionLabel(session) {
    if (!session.real_session_date) {
        return session.session_title;
    }
    const d = new Date(session.real_session_date);
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const y = String(d.getUTCFullYear()).slice(-2);
    return `${m}.${day}.${y} — "${session.session_title}"`;
}
