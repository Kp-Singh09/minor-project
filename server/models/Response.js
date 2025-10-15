// server/models/Response.js
import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  score: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    answer: { type: mongoose.Schema.Types.Mixed, required: true },
    points: { type: Number, default: 0 } // 👈 Add this field
  }],
  submittedAt: { type: Date, default: Date.now }
});

const Response = mongoose.model('Response', responseSchema);
export default Response;