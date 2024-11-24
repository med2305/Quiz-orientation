import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctOption: {
    type: Number,
    required: true,
    min: 0
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  questions: {
    type: [questionSchema],
    required: true,
    validate: [
      {
        validator: function(questions) {
          return questions.length > 0;
        },
        message: 'Un quiz doit avoir au moins une question'
      }
    ]
  },
  category: {
    type: String,
    required: true
  },
  niveau: {
    type: String,
    required: true,
    enum: ['bac', 'bac+1', 'bac+2', 'bac+3', 'bac+4', 'bac+5', 'bac+6', '>bac+6']
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add index for faster queries
quizSchema.index({ niveau: 1, active: 1 });
quizSchema.index({ category: 1 });
quizSchema.index({ createdAt: -1 });

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);

export default Quiz;
