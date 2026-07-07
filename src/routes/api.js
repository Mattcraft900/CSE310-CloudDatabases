import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

router.get('/profiles', async (req, res, next) => {
    try {
        const { rows: profiles } = await pool.query(
            'SELECT * FROM profiles ORDER BY id'
        );
        for (const profile of profiles) {
            const { rows: classes } = await pool.query(
                'SELECT * FROM profile_classes WHERE profile_id = $1 ORDER BY sort_order',
                [profile.id]
            );
            profile.classes = classes;
        }
        res.json(profiles);
    } catch (err) {
        next(err);
    }
});

router.get('/profiles/:id', async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM profiles WHERE id = $1', [
            req.params.id,
        ]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const profile = rows[0];
        const { rows: classes } = await pool.query(
            'SELECT * FROM profile_classes WHERE profile_id = $1 ORDER BY sort_order',
            [profile.id]
        );
        profile.classes = classes;
        res.json(profile);
    } catch (err) {
        next(err);
    }
});

router.get('/travelogue/sessions', async (req, res, next) => {
    try {
        const { rows: sessions } = await pool.query(
            'SELECT * FROM travelogue_sessions ORDER BY sort_order, id'
        );
        for (const session of sessions) {
            const { rows: sections } = await pool.query(
                'SELECT * FROM travelogue_sections WHERE session_id = $1 ORDER BY sort_order, id',
                [session.id]
            );
            session.sections = sections;
        }
        res.json(sessions);
    } catch (err) {
        next(err);
    }
});

router.get('/travelogue/sessions/:id', async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM travelogue_sessions WHERE id = $1',
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const session = rows[0];
        const { rows: sections } = await pool.query(
            'SELECT * FROM travelogue_sections WHERE session_id = $1 ORDER BY sort_order, id',
            [session.id]
        );
        session.sections = sections;
        res.json(session);
    } catch (err) {
        next(err);
    }
});

export default router;
