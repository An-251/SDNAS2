import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import { engine as exphbs } from 'express-handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const projectRoot = path.join(__dirname, '..');
const viewsPath = path.join(projectRoot, 'views');
const layoutsPath = path.join(viewsPath, 'layouts');
const partialsPath = path.join(viewsPath, 'partials');

const app = express();

// ─── View engines ───────────────────────────────────────────────────────────
app.engine(
  'hbs',
  exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: layoutsPath,
    partialsDir: partialsPath,
  })
);
app.set('view engine', 'hbs');
app.set('views', viewsPath);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(projectRoot, 'public')));

// ─── Database Connection ──────────────────────────────────────────────────────
const MONGO_URI =
  process.env.MONGO_URL;

mongoose
  .connect(MONGO_URI)
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });

// ─── Routes ───────────────────────────────────────────────────────────────────
import quizRoutes from './routes/quizRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import uiQuizRoutes from './ui/routes/quizRoutes.js';
import uiQuestionRoutes from './ui/routes/questionRoutes.js';

app.get('/', (_req, res) => {
  res.render('index', { title: 'Question Bank' });
});

app.use('/quizzes', uiQuizRoutes);
app.use('/questions', uiQuestionRoutes);

app.get('/api', (_req, res) => {
  res.json({ message: 'SimpleQuiz API is running 🚀' });
});

app.use('/api/quizzes', quizRoutes);
app.use('/api/question', questionRoutes);
app.use('/api/questions', questionRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ message: 'Route not found' });
    return;
  }

  res.status(404).render('not-found', { title: 'Page not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);

  if (req.path.startsWith('/api')) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
    return;
  }

  const message = err?.response?.data?.message || err.message || 'Unexpected error';
  res.status(500).render('error', { title: 'Something went wrong', message });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐  Server listening on http://localhost:${PORT}`);
});