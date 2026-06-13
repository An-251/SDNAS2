import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';

// ─── GET /quizzes ─────────────────────────────────────────────────────────────
// Retrieve all quizzes without populating questions
export const getAllQuizzes = async (_req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /quizzes/:quizId ─────────────────────────────────────────────────────
// Retrieve a single quiz by ID without populating questions
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /quizzes ────────────────────────────────────────────────────────────
// Create a new quiz
export const createQuiz = async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    const quiz = await Quiz.create({ title, description, questions: questions || [] });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ─── PUT /quizzes/:quizId ─────────────────────────────────────────────────────
// Update a quiz by ID
export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      req.body,
      { new: true, runValidators: true }
    ).populate('questions');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json(quiz);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ─── DELETE /quizzes/:quizId ──────────────────────────────────────────────────
// Delete a quiz by ID
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    // Also delete any questions that belonged to this quiz
    if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
      await Question.deleteMany({ _id: { $in: quiz.questions } });
    }

    res.status(200).json({ message: 'Quiz and its questions deleted successfully', quiz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /quizzes/:quizId/populate ───────────────────────────────────────────
// Task 3: Return all questions in the quiz whose text contains the word "capital"
export const populateCapitalQuestions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate({
      path: 'questions',
      match: { text: { $regex: 'capital', $options: 'i' } },
    });

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // After populate with match, quiz.questions contains only the matched ones
    res.status(200).json({
      quizId:    quiz._id,
      title:     quiz.title,
      questions: quiz.questions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /quizzes/:quizId/question ──────────────────────────────────────────
// Task 4: Create ONE new question and add it to the quiz
export const addOneQuestionToQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (Array.isArray(req.body)) {
      return res.status(400).json({ message: 'Request body must be a single question object' });
    }

    const { text, options, keywords, correctAnswerIndex } = req.body;
    const newQuestion = await Question.create({ text, options, keywords, correctAnswerIndex });

    quiz.questions.push(newQuestion._id);
    await quiz.save();

    // Return updated quiz with populated questions
    const updatedQuiz = await Quiz.findById(quiz._id).populate('questions');
    res.status(201).json(updatedQuiz);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ─── POST /quizzes/:quizId/questions ─────────────────────────────────────────
// Task 5: Create MANY new questions and add them all to the quiz
export const addManyQuestionsToQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // req.body should be an array of question objects
    const questionsData = req.body;
    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      return res.status(400).json({ message: 'Request body must be a non-empty array of questions' });
    }

    // Bulk-insert all questions at once
    const newQuestions = await Question.insertMany(questionsData);

    // Push all new question IDs into the quiz
    const newIds = newQuestions.map((q) => q._id);
    quiz.questions.push(...newIds);
    await quiz.save();

    // Return updated quiz with populated questions
    const updatedQuiz = await Quiz.findById(quiz._id).populate('questions');
    res.status(201).json(updatedQuiz);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};