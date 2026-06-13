import express from 'express';
import * as controller from '../controllers/quizController.js';

const router = express.Router();

// ── Core CRUD ──────────────────────────────────────────────────────────────────

// GET    /quizzes              → list all quizzes (questions populated)
router.get('/',                              controller.getAllQuizzes);

// GET    /quizzes/:quizId      → get one quiz (questions populated)
router.get('/:quizId',                       controller.getQuizById);

// POST   /quizzes              → create a quiz
router.post('/',                             controller.createQuiz);

// PUT    /quizzes/:quizId      → update a quiz
router.put('/:quizId',                       controller.updateQuiz);

// DELETE /quizzes/:quizId      → delete a quiz
router.delete('/:quizId',                    controller.deleteQuiz);

// ── Special endpoints ──────────────────────────────────────────────────────────

// GET  /quizzes/:quizId/populate   → Task 3: filter questions with "capital"
router.get('/:quizId/populate',              controller.populateCapitalQuestions);

// POST /quizzes/:quizId/question   → Task 4: add ONE new question to quiz
router.post('/:quizId/question',             controller.addOneQuestionToQuiz);

// POST /quizzes/:quizId/questions  → Task 5: add MANY new questions to quiz
router.post('/:quizId/questions',            controller.addManyQuestionsToQuiz);

export default router;