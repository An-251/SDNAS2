import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

const questionTemplates = [
  {
    text: 'What is the capital of France?',
    options: ['Paris', 'London', 'Berlin', 'Rome'],
    keywords: ['capital', 'france', 'europe'],
    correctAnswerIndex: 0,
  },
  {
    text: 'What is the capital of Japan?',
    options: ['Tokyo', 'Seoul', 'Beijing', 'Bangkok'],
    keywords: ['capital', 'japan', 'asia'],
    correctAnswerIndex: 0,
  },
  {
    text: 'What is the capital of Vietnam?',
    options: ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hue'],
    keywords: ['capital', 'vietnam', 'asia'],
    correctAnswerIndex: 0,
  },
  {
    text: 'Which planet is known as the Red Planet?',
    options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
    keywords: ['planet', 'science', 'space'],
    correctAnswerIndex: 1,
  },
  {
    text: 'Which language runs in the browser?',
    options: ['Python', 'C++', 'JavaScript', 'Java'],
    keywords: ['programming', 'web', 'javascript'],
    correctAnswerIndex: 2,
  },
  {
    text: 'What is the capital of Italy?',
    options: ['Rome', 'Milan', 'Naples', 'Venice'],
    keywords: ['capital', 'italy', 'europe'],
    correctAnswerIndex: 0,
  },
];

const quizTemplates = [
  {
    title: 'World Capitals',
    description: 'Seeded quiz for capital-city testing',
    questionIndexes: [0, 1, 2, 5],
  },
  {
    title: 'Mixed Knowledge',
    description: 'General knowledge seed quiz',
    questionIndexes: [2, 3, 4],
  },
];

const createObjectIdFromCounter = (counter) => counter.toString(16).padStart(24, '0');

async function main() {
  await prisma.quiz.deleteMany();
  await prisma.question.deleteMany();

  const questions = [];

  for (const [index, template] of questionTemplates.entries()) {
    const id = createObjectIdFromCounter(index + 1);
    const question = await prisma.question.create({
      data: {
        id,
        ...template,
      },
    });

    questions.push(question);
  }

  for (const [index, quizTemplate] of quizTemplates.entries()) {
    const id = createObjectIdFromCounter(index + 101);
    await prisma.quiz.create({
      data: {
        id,
        title: quizTemplate.title,
        description: quizTemplate.description,
        questions: quizTemplate.questionIndexes.map((questionIndex) => questions[questionIndex].id),
      },
    });
  }

  console.log('Seed completed: quizzes and questions inserted successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });