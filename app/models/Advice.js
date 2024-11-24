import mongoose from 'mongoose';

const adviceSchema = new mongoose.Schema({
  conseillerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  }
}, { timestamps: true });

const Advice = mongoose.models.Advice || mongoose.model('Advice', adviceSchema);

export default Advice;
