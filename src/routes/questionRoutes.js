import express from 'express';
import * as controller from '../controllers/questionController.js';

const router = express.Router();

// GET    /question or /questions          → list all questions
router.get('/',                   controller.getAllQuestions);

// GET    /question/:questionId or /questions/:questionId  → get one question
router.get('/:questionId',        controller.getQuestionById);

// POST   /question or /questions          → create a question
router.post('/',                  controller.createQuestion);

// PUT    /question/:questionId or /questions/:questionId  → update a question
router.put('/:questionId',        controller.updateQuestion);

// DELETE /question/:questionId or /questions/:questionId  → delete a question
router.delete('/:questionId',     controller.deleteQuestion);

export default router;