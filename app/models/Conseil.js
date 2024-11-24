import mongoose from 'mongoose';

const conseilSchema = new mongoose.Schema({
  conseiller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contenu: { type: String, required: true },
  dateConseil: { type: Date, default: Date.now },
}, { timestamps: true });

const Conseil = mongoose.models.Conseil || mongoose.model('Conseil', conseilSchema);
export default Conseil;
