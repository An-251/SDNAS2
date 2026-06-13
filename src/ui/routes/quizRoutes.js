import express from 'express';
import { apiClient } from '../services/apiClient.js';
import { buildQuizPayload } from '../utils/formParsers.js';
import { resolveFormMethod } from '../utils/methodOverride.js';

const router = express.Router();

const toId = (value) => {
  if (!value) return null;

  if (typeof value === 'object') {
    return value._id?.toString() || null;
  }

  return value.toString();
};

const normalizeQuestionIds = (value) => {
  if (!value) return [];

  return (Array.isArray(value) ? value : [value])
    .map(toId)
    .filter(Boolean);
};

const updateQuiz = async (req, res, next) => {
  try {
    const payload = buildQuizPayload(req.body);
    const { data } = await apiClient.put(`/quizzes/${req.params.quizId}`, payload);
    res.redirect(`/quizzes/${data._id}`);
  } catch (err) {
    next(err);
  }
};

const deleteQuiz = async (req, res, next) => {
  try {
    await apiClient.delete(`/quizzes/${req.params.quizId}`);
    res.redirect('/quizzes');
  } catch (err) {
    next(err);
  }
};

router.get('/', async (_req, res, next) => {
  try {
    const { data } = await apiClient.get('/quizzes');
    const quizzes = (data || []).map((quiz) => ({
      ...quiz,
      questionCount: Array.isArray(quiz.questions) ? quiz.questions.length : 0,
    }));

    res.render('quiz/list', {
      title: 'Quizzes',
      active: 'quizzes',
      quizzes,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/new', (_req, res) => {
  res.render('quiz/create', { title: 'Create Quiz', active: 'quizzes' });
});

router.post('/', async (req, res, next) => {
  try {
    const payload = buildQuizPayload(req.body);
    const { data } = await apiClient.post('/quizzes', payload);
    const targetId = data?._id;

    res.redirect(targetId ? `/quizzes/${targetId}` : '/quizzes');
  } catch (err) {
    next(err);
  }
});

router.get('/:quizId', async (req, res, next) => {
  try {
    const [quizResponse, questionsResponse] = await Promise.all([
      apiClient.get(`/quizzes/${req.params.quizId}`),
      apiClient.get('/questions'),
    ]);

    const quiz = quizResponse.data;
    const allQuestions = questionsResponse.data || [];
    const quizQuestionIds = new Set(normalizeQuestionIds(quiz.questions));
    const availableQuestions = allQuestions.filter((question) => {
      const id = toId(question);
      return id && !quizQuestionIds.has(id);
    });
    const quizQuestions = (quiz.questions || []).map((question) => ({
      ...question,
      optionCount: Array.isArray(question.options) ? question.options.length : 0,
    }));
    const quizTitle = quiz.title || 'Quiz details';

    res.render('quiz/details', {
      title: quizTitle,
      active: 'quizzes',
      quiz: {
        ...quiz,
        questions: quizQuestions,
      },
      availableQuestions,
      hasQuestions: quizQuestions.length > 0,
      hasAvailableQuestions: availableQuestions.length > 0,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:quizId/edit', async (req, res, next) => {
  try {
    const { data } = await apiClient.get(`/quizzes/${req.params.quizId}`);
    res.render('quiz/edit', {
      title: 'Edit Quiz',
      active: 'quizzes',
      quiz: data,
    });
  } catch (err) {
    next(err);
  }
});

router.put('/:quizId', updateQuiz);

router.delete('/:quizId', deleteQuiz);

router.post('/:quizId/questions', async (req, res, next) => {
  try {
    const questionIds = normalizeQuestionIds(req.body.questionIds);

    if (questionIds.length === 0) {
      res.redirect(`/quizzes/${req.params.quizId}`);
      return;
    }

    const { data: quiz } = await apiClient.get(`/quizzes/${req.params.quizId}`);
    const currentIds = normalizeQuestionIds(quiz.questions);
    const mergedIds = [...new Set([...currentIds, ...questionIds])];

    if (mergedIds.length !== currentIds.length) {
      await apiClient.put(`/quizzes/${req.params.quizId}`, { questions: mergedIds });
    }

    res.redirect(`/quizzes/${req.params.quizId}`);
  } catch (err) {
    next(err);
  }
});

router.post('/:quizId', (req, res, next) => {
  const override = resolveFormMethod(req);

  if (override === 'PUT') {
    updateQuiz(req, res, next);
    return;
  }

  if (override === 'DELETE') {
    deleteQuiz(req, res, next);
    return;
  }

  res.redirect(`/quizzes/${req.params.quizId}`);
});

export default router;
