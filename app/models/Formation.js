import mongoose from 'mongoose';

const formationSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  specialite: { type: String, required: true },
  niveauMinRequis: { type: String, required: true },
}, { timestamps: true });

const Formation = mongoose.models.Formation || mongoose.model('Formation', formationSchema);
export default Formation;
