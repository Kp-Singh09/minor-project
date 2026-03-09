// server/models/Response.js
import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
  formId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Form', 
    required: true 
  },
  
  // User Identification
  userId: { type: String, required: true }, // The Clerk User ID of the respondent
  userEmail: { type: String, required: true },
  username: { type: String, default: 'Anonymous' },
  
  // Scoring
  score: { type: Number, default: 0 }, // Calculated based on objective answers
  totalMarks: { type: Number, default: 0 },
  
  // AI Grading Fields (NEW)
  aiScore: { type: Number, default: 0 }, // Score assigned by LLM
  aiFeedback: { type: String, default: '' }, // Feedback from LLM
  status: { 
    type: String, 
    enum: ['Pending', 'Graded', 'Flagged'], 
    default: 'Pending' 
  },

  // Integrity Data (For Proctoring)
  integrityFlags: [{
    type: { type: String }, // e.g., 'Tab Switch', 'Multiple Faces'
    timestamp: { type: Date, default: Date.now }
  }],

  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    answer: { type: mongoose.Schema.Types.Mixed, required: true },
    points: { type: Number, default: 0 }
  }],
  
  submittedAt: { type: Date, default: Date.now }
});

const Response = mongoose.model('Response', responseSchema);
export default Response;