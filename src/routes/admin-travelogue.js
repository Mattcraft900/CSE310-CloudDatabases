import { Router } from 'express';
import pool from '../db/pool.js';
import {
    emptyToNull,
    paragraphsFromText,
    textFromParagraphs,
    parseIntOrNull,
    parseRealSessionDate,
    formatSessionLabel,
} from '../utils/form.js';

const router = Router();

router.get('/sessions', async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM travelogue_sessions ORDER BY sort_order, id'
        );
        const sessions = rows.map((s) => ({
            ...s,
            label: formatSessionLabel(s),
        }));
        res.render('admin/travelogue/sessions-list', {
            sessions,
            message: req.query.message,
        });
    } catch (err) {
        next(err);
    }
});

router.get('/sessions/new', (req, res) => {
    res.render('admin/travelogue/session-form', { session: {}, isNew: true });
});

router.post('/sessions', async (req, res, next) => {
    try {
        const body = req.body;
        let realDate = emptyToNull(body.real_session_date);
        if (body.real_session_date_mdy) {
            realDate = parseRealSessionDate(body.real_session_date_mdy);
        }
        const title = emptyToNull(body.session_title);
        if (!title) {
            return res.status(400).send('Session title is required');
        }
        const { rows } = await pool.query(
            `INSERT INTO travelogue_sessions (real_session_date, session_title, sort_order)
             VALUES ($1, $2, $3) RETURNING id`,
            [realDate, title, parseIntOrNull(body.sort_order) ?? 0]
        );
        res.redirect(`/admin/travelogue/sessions/${rows[0].id}?message=Session+created`);
    } catch (err) {
        next(err);
    }
});

router.get('/sessions/:id', async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM travelogue_sessions WHERE id = $1',
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).send('Session not found');
        const session = rows[0];
        session.label = formatSessionLabel(session);
        const { rows: sections } = await pool.query(
            'SELECT * FROM travelogue_sections WHERE session_id = $1 ORDER BY sort_order, id',
            [session.id]
        );
        res.render('admin/travelogue/session-detail', {
            session,
            sections,
            message: req.query.message,
        });
    } catch (err) {
        next(err);
    }
});

router.get('/sessions/:id/edit', async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM travelogue_sessions WHERE id = $1',
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).send('Session not found');
        res.render('admin/travelogue/session-form', { session: rows[0], isNew: false });
    } catch (err) {
        next(err);
    }
});

router.put('/sessions/:id', async (req, res, next) => {
    try {
        const body = req.body;
        let realDate = emptyToNull(body.real_session_date);
        if (body.real_session_date_mdy) {
            realDate = parseRealSessionDate(body.real_session_date_mdy);
        }
        const title = emptyToNull(body.session_title);
        await pool.query(
            `UPDATE travelogue_sessions SET
                real_session_date=$1, session_title=$2, sort_order=$3, updated_at=NOW()
             WHERE id=$4`,
            [realDate, title, parseIntOrNull(body.sort_order) ?? 0, req.params.id]
        );
        res.redirect(
            `/admin/travelogue/sessions/${req.params.id}?message=Session+updated`
        );
    } catch (err) {
        next(err);
    }
});

router.delete('/sessions/:id', async (req, res, next) => {
    try {
        await pool.query('DELETE FROM travelogue_sessions WHERE id = $1', [
            req.params.id,
        ]);
        res.redirect('/admin/travelogue/sessions?message=Session+deleted');
    } catch (err) {
        next(err);
    }
});

router.get('/sessions/:sessionId/sections/new', (req, res) => {
    res.render('admin/travelogue/section-form', {
        section: { session_id: req.params.sessionId },
        paragraphsText: '',
        isNew: true,
        sessionId: req.params.sessionId,
    });
});

router.post('/sessions/:sessionId/sections', async (req, res, next) => {
    try {
        const paragraphs = paragraphsFromText(req.body.paragraphs);
        await pool.query(
            `INSERT INTO travelogue_sections (session_id, in_game_date, paragraphs, sort_order)
             VALUES ($1, $2, $3, $4)`,
            [
                req.params.sessionId,
                emptyToNull(req.body.in_game_date),
                JSON.stringify(paragraphs),
                parseIntOrNull(req.body.sort_order) ?? 0,
            ]
        );
        res.redirect(
            `/admin/travelogue/sessions/${req.params.sessionId}?message=Section+added`
        );
    } catch (err) {
        next(err);
    }
});

router.get('/sections/:id/edit', async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM travelogue_sections WHERE id = $1',
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).send('Section not found');
        const section = rows[0];
        res.render('admin/travelogue/section-form', {
            section,
            paragraphsText: textFromParagraphs(section.paragraphs),
            isNew: false,
            sessionId: section.session_id,
        });
    } catch (err) {
        next(err);
    }
});

router.put('/sections/:id', async (req, res, next) => {
    try {
        const paragraphs = paragraphsFromText(req.body.paragraphs);
        const { rows } = await pool.query(
            'SELECT session_id FROM travelogue_sections WHERE id = $1',
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).send('Section not found');
        const sessionId = rows[0].session_id;

        await pool.query(
            `UPDATE travelogue_sections SET
                in_game_date=$1, paragraphs=$2, sort_order=$3, updated_at=NOW()
             WHERE id=$4`,
            [
                emptyToNull(req.body.in_game_date),
                JSON.stringify(paragraphs),
                parseIntOrNull(req.body.sort_order) ?? 0,
                req.params.id,
            ]
        );
        res.redirect(
            `/admin/travelogue/sessions/${sessionId}?message=Section+updated`
        );
    } catch (err) {
        next(err);
    }
});

router.delete('/sections/:id', async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            'SELECT session_id FROM travelogue_sections WHERE id = $1',
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).send('Section not found');
        const sessionId = rows[0].session_id;
        await pool.query('DELETE FROM travelogue_sections WHERE id = $1', [
            req.params.id,
        ]);
        res.redirect(
            `/admin/travelogue/sessions/${sessionId}?message=Section+deleted`
        );
    } catch (err) {
        next(err);
    }
});

export default router;
