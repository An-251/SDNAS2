import mongoose from 'mongoose';

/**
 * Quiz Schema
 * Represents a quiz containing multiple questions.
 */
const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    // Array of ObjectId references to Question documents
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);