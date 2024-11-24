import mongoose from 'mongoose';

const completedQuizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  answers: [{
    questionIndex: {
      type: Number,
      required: true
    },
    selectedOption: {
      type: Number,
      required: true
    },
    correct: {
      type: Boolean,
      required: true
    }
  }],
  timeSpent: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a compound index for userId and quizId
completedQuizSchema.index({ userId: 1, quizId: 1 }, { unique: true });

export default mongoose.models.CompletedQuiz || mongoose.model('CompletedQuiz', completedQuizSchema);
