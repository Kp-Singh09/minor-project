// server/models/Question.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true // mcq, cloze, categorize, comprehension, etc.
  },
  content: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  points: { 
    type: Number, 
    default: 0 
  },
  // NEW: Advanced Branching Logic
  logic: [{
    condition: String,   // e.g., "Answer Equals 'Option A'"
    action: { 
      type: String, 
      enum: ['jump_to', 'end_form', 'skip_section'],
      default: 'jump_to'
    },
    destination: String  // The ID of the question to jump to
  }],
  formId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Form',
    required: true 
  }
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);