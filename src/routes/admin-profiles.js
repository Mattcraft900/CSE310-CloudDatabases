import { Router } from 'express';
import pool from '../db/pool.js';
import {
    emptyToNull,
    paragraphsFromText,
    textFromParagraphs,
    parseIntOrNull,
} from '../utils/form.js';

const router = Router();

function parseClassesFromBody(body) {
    const classes = [];
    const names = [].concat(body.class_name || []);
    const levels = [].concat(body.class_level || []);
    const subclasses = [].concat(body.class_subclass || []);
    for (let i = 0; i < names.length; i++) {
        const class_name = emptyToNull(names[i]);
        if (!class_name) continue;
        classes.push({
            class_name,
            level: parseIntOrNull(levels[i]) ?? 1,
            subclass: emptyToNull(subclasses[i]),
            sort_order: classes.length,
        });
    }
    return classes;
}

async function loadProfile(id) {
    const { rows } = await pool.query('SELECT * FROM profiles WHERE id = $1', [id]);
    if (rows.length === 0) return null;
    const profile = rows[0];
    const { rows: classes } = await pool.query(
        'SELECT * FROM profile_classes WHERE profile_id = $1 ORDER BY sort_order',
        [id]
    );
    profile.classes = classes;
    return profile;
}

router.get('/', async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            'SELECT id, name, category, snippet FROM profiles ORDER BY id'
        );
        res.render('admin/profiles/list', { profiles: rows, message: req.query.message });
    } catch (err) {
        next(err);
    }
});

router.get('/new', (req, res) => {
    res.render('admin/profiles/form', {
        profile: {},
        classes: [],
        descriptionText: '',
        isNew: true,
    });
});

router.post('/', async (req, res, next) => {
    try {
        const body = req.body;
        const description = paragraphsFromText(body.description);
        const fullName = emptyToNull(body.full_name);
        const name = emptyToNull(body.name);

        const result = await pool.query(
            `INSERT INTO profiles (
                name, full_name, gender, species, age, birthday, height, weight,
                category, snippet, image_filename, player_name, level,
                location_home, location_last, description
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
            RETURNING id`,
            [
                name,
                fullName === name ? null : fullName,
                emptyToNull(body.gender),
                emptyToNull(body.species),
                emptyToNull(body.age),
                emptyToNull(body.birthday),
                emptyToNull(body.height),
                emptyToNull(body.weight),
                body.category || 'npc',
                emptyToNull(body.snippet),
                emptyToNull(body.image_filename),
                emptyToNull(body.player_name),
                parseIntOrNull(body.level),
                emptyToNull(body.location_home),
                emptyToNull(body.location_last),
                JSON.stringify(description),
            ]
        );

        const profileId = result.rows[0].id;
        for (const c of parseClassesFromBody(body)) {
            await pool.query(
                `INSERT INTO profile_classes (profile_id, class_name, subclass, level, sort_order)
                 VALUES ($1, $2, $3, $4, $5)`,
                [profileId, c.class_name, c.subclass, c.level, c.sort_order]
            );
        }

        res.redirect('/admin/profiles?message=Profile+created');
    } catch (err) {
        next(err);
    }
});

router.get('/:id/edit', async (req, res, next) => {
    try {
        const profile = await loadProfile(req.params.id);
        if (!profile) return res.status(404).send('Profile not found');
        res.render('admin/profiles/form', {
            profile,
            classes: profile.classes,
            descriptionText: textFromParagraphs(profile.description),
            isNew: false,
        });
    } catch (err) {
        next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const body = req.body;
        const description = paragraphsFromText(body.description);
        const fullName = emptyToNull(body.full_name);
        const name = emptyToNull(body.name);

        await pool.query(
            `UPDATE profiles SET
                name=$1, full_name=$2, gender=$3, species=$4, age=$5, birthday=$6,
                height=$7, weight=$8, category=$9, snippet=$10, image_filename=$11,
                player_name=$12, level=$13, location_home=$14, location_last=$15,
                description=$16, updated_at=NOW()
             WHERE id=$17`,
            [
                name,
                fullName === name ? null : fullName,
                emptyToNull(body.gender),
                emptyToNull(body.species),
                emptyToNull(body.age),
                emptyToNull(body.birthday),
                emptyToNull(body.height),
                emptyToNull(body.weight),
                body.category || 'npc',
                emptyToNull(body.snippet),
                emptyToNull(body.image_filename),
                emptyToNull(body.player_name),
                parseIntOrNull(body.level),
                emptyToNull(body.location_home),
                emptyToNull(body.location_last),
                JSON.stringify(description),
                req.params.id,
            ]
        );

        await pool.query('DELETE FROM profile_classes WHERE profile_id = $1', [
            req.params.id,
        ]);
        for (const c of parseClassesFromBody(body)) {
            await pool.query(
                `INSERT INTO profile_classes (profile_id, class_name, subclass, level, sort_order)
                 VALUES ($1, $2, $3, $4, $5)`,
                [req.params.id, c.class_name, c.subclass, c.level, c.sort_order]
            );
        }

        res.redirect('/admin/profiles?message=Profile+updated');
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        await pool.query('DELETE FROM profiles WHERE id = $1', [req.params.id]);
        res.redirect('/admin/profiles?message=Profile+deleted');
    } catch (err) {
        next(err);
    }
});

export default router;
