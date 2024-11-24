import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema({
  nom: { type: String, required: true },
  specialite: [{ type: String, required: true }],
}, { timestamps: true });

const University = mongoose.models.University || mongoose.model('University', universitySchema);
export default University;
