import mongoose from 'mongoose';

/**
 * Question Schema
 * Represents a single question in a quiz.
 */
const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },

    options: {
      type: [String],
      required: [true, 'Options array is required'],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 2,
        message: 'A question must have at least 2 options',
      },
    },

    keywords: {
      type: [String],
      default: [],
    },

    correctAnswerIndex: {
      type: Number,
      required: [true, 'correctAnswerIndex is required'],
      min: [0, 'correctAnswerIndex must be >= 0'],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);