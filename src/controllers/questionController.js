import Question from '../models/Question.js';

// ─── GET /questions ───────────────────────────────────────────────────────────
// Retrieve all questions
export const getAllQuestions = async (_req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /questions/:questionId ───────────────────────────────────────────────
// Retrieve a single question by ID
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /questions ──────────────────────────────────────────────────────────
// Create a new standalone question
export const createQuestion = async (req, res) => {
  try {
    const { text, options, keywords, correctAnswerIndex } = req.body;
    const question = await Question.create({ text, options, keywords, correctAnswerIndex });
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ─── PUT /questions/:questionId ───────────────────────────────────────────────
// Update a question by ID
export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.questionId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json(question);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ─── DELETE /questions/:questionId ────────────────────────────────────────────
// Delete a question by ID
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json({ message: 'Question deleted successfully', question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};