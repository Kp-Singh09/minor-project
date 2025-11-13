// server/models/Question.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    // --- UPDATED: Add new simple types ---
    enum: ['Categorize', 'Cloze', 'Comprehension', 'Heading', 'Paragraph', 'Banner']
  },
  // --- UPDATED: Add 'text' field for Heading/Paragraph ---
  text: { type: String, default: '' },
  
  // This will store the URL from ImageKit for a specific question (used by Banner)
  image: { type: String, default: null },

  // Fields for 'Categorize' type
  categories: [{ type: String }],
  items: [{
    text: String,
    category: String 
  }],

  // Fields for 'Cloze' type
  passage: { type: String }, 
  options: [{ type: String }], 

  // Fields for 'Comprehension' type
  comprehensionPassage: { type: String }, 
  mcqs: [{
    questionText: String,
    options: [String],
    correctAnswer: String
  }]
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);
export default Question;