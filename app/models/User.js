import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  nom: {
    type: String,
    required: true,
  },
  prenom: {
    type: String,
    required: true,
  },
  tel: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'conseiller', 'student'],
    default: 'student',
  },
  // Student-specific fields
  moyenne: { 
    type: Number,
  },
  score: { 
    type: Number,
  },
  niveau: { 
    type: String,
  },
  interet: {
    type: [String],
  },
  // Counselor-specific field
  specialite: { 
    type: String,
    default: undefined,
    required: false
  }
}, { timestamps: true });

// Pre-save middleware to handle role-specific fields
userSchema.pre('save', function(next) {
  // For non-student roles, set student fields to null
  if (this.role !== 'student') {
    this.moyenne = null;
    this.score = null;
    this.niveau = null;
    this.interet = [];
  }
  
  // For non-counselor roles, set counselor fields to null
  if (this.role !== 'conseiller') {
    this.specialite = null;
  }
  
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
