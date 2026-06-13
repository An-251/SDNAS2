import express from 'express';
import { apiClient } from '../services/apiClient.js';
import { buildQuestionPayload } from '../utils/formParsers.js';
import { resolveFormMethod } from '../utils/methodOverride.js';

const router = express.Router();

const toId = (value) => {
  if (!value) return null;

  if (typeof value === 'object') {
    return value._id?.toString() || null;
  }

  return value.toString();
};

const updateQuestion = async (req, res, next) => {
  try {
    const payload = buildQuestionPayload(req.body);
    const { data } = await apiClient.put(`/questions/${req.params.questionId}`, payload);
    res.redirect(`/questions/${data._id}`);
  } catch (err) {
    next(err);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    await apiClient.delete(`/questions/${req.params.questionId}`);
    res.redirect('/questions');
  } catch (err) {
    next(err);
  }
};

router.get('/', async (_req, res, next) => {
  try {
    const [questionsResponse, quizzesResponse] = await Promise.all([
      apiClient.get('/questions'),
      apiClient.get('/quizzes'),
    ]);
    const quizIndex = new Map();

    (quizzesResponse.data || []).forEach((quiz) => {
      (quiz.questions || []).forEach((question) => {
        const id = toId(question);

        if (!id) return;

        if (!quizIndex.has(id)) {
          quizIndex.set(id, []);
        }

        quizIndex.get(id).push(quiz.title || 'Untitled quiz');
      });
    });

    const questions = (questionsResponse.data || []).map((question) => {
      const id = toId(question);
      const quizTitles = quizIndex.get(id) || [];

      return {
        ...question,
        quizTitles,
        quizTitlesText: quizTitles.join(', '),
        optionCount: Array.isArray(question.options) ? question.options.length : 0,
      };
    });

    res.render('question/list', {
      title: 'Questions',
      active: 'questions',
      questions,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/new', (_req, res) => {
  res.render('question/create', { title: 'Create Question', active: 'questions' });
});

router.get('/:questionId/try', async (req, res, next) => {
  try {
    const { data } = await apiClient.get(`/questions/${req.params.questionId}`);
    const options = (data.options || []).map((option, index) => ({
      index,
      option,
      isCorrect: index === data.correctAnswerIndex,
    }));

    res.render('question/try', {
      title: 'Try Question',
      active: 'questions',
      question: {
        ...data,
        options,
      },
      result: null,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:questionId/try', async (req, res, next) => {
  try {
    const { data } = await apiClient.get(`/questions/${req.params.questionId}`);
    const parsedAnswer = Number.parseInt(req.body.answerIndex, 10);
    const hasAnswer = Number.isInteger(parsedAnswer);
    const isCorrect = hasAnswer && parsedAnswer === data.correctAnswerIndex;
    const options = (data.options || []).map((option, index) => ({
      index,
      option,
      isCorrect: index === data.correctAnswerIndex,
      isSelected: parsedAnswer === index,
    }));

    res.render('question/try', {
      title: 'Try Question',
      active: 'questions',
      question: {
        ...data,
        options,
      },
      result: {
        answerIndex: hasAnswer ? parsedAnswer : null,
        isCorrect,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = buildQuestionPayload(req.body);
    const { data } = await apiClient.post('/questions', payload);
    const targetId = data?._id;

    res.redirect(targetId ? `/questions/${targetId}` : '/questions');
  } catch (err) {
    next(err);
  }
});

router.get('/:questionId', async (req, res, next) => {
  try {
    const { data } = await apiClient.get(`/questions/${req.params.questionId}`);
    const correctText =
      Array.isArray(data.options) && Number.isInteger(data.correctAnswerIndex)
        ? data.options[data.correctAnswerIndex]
        : null;
    const options = (data.options || []).map((option, index) => ({
      index,
      option,
    }));
    const keywordsText = (data.keywords || []).join(', ');

    res.render('question/details', {
      title: 'Question details',
      active: 'questions',
      question: {
        ...data,
        options,
        correctText,
        keywordsText: keywordsText || 'None',
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:questionId/edit', async (req, res, next) => {
  try {
    const { data } = await apiClient.get(`/questions/${req.params.questionId}`);
    res.render('question/edit', {
      title: 'Edit Question',
      active: 'questions',
      question: {
        ...data,
        optionsText: (data.options || []).join(', '),
        keywordsText: (data.keywords || []).join(', '),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.put('/:questionId', updateQuestion);

router.delete('/:questionId', deleteQuestion);

router.post('/:questionId', (req, res, next) => {
  const override = resolveFormMethod(req);

  if (override === 'PUT') {
    updateQuestion(req, res, next);
    return;
  }

  if (override === 'DELETE') {
    deleteQuestion(req, res, next);
    return;
  }

  res.redirect(`/questions/${req.params.questionId}`);
});

export default router;
