const splitCommaList = (value) => {
  if (!value) return [];

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const buildQuizPayload = (body) => ({
  title: body.title?.trim(),
  description: body.description?.trim() || '',
});

export const buildQuestionPayload = (body) => {
  const parsedIndex = Number.parseInt(body.correctAnswerIndex, 10);

  return {
    text: body.text?.trim(),
    options: splitCommaList(body.options),
    keywords: splitCommaList(body.keywords),
    correctAnswerIndex: Number.isNaN(parsedIndex) ? undefined : parsedIndex,
  };
};
