import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import methodOverride from 'method-override';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import adminProfilesRouter from './routes/admin-profiles.js';
import adminTravelogueRouter from './routes/admin-travelogue.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => res.redirect('/admin'));
app.get('/admin', (req, res) => {
    res.render('admin/home', { message: req.query.message });
});

app.use('/api', apiRouter);
app.use('/admin/profiles', adminProfilesRouter);
app.use('/admin/travelogue', adminTravelogueRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(`Error: ${err.message}`);
});

app.listen(PORT, () => {
    console.log(`Deathless DB admin running at http://localhost:${PORT}/admin`);
});
