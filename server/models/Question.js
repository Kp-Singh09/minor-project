// server/models/Question.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      // Complex Types
      'Categorize', 'Cloze', 'Comprehension', 
      // Simple Display Types
      'Heading', 'Paragraph', 'Banner',
      // --- NEW: Simple Input Types ---
      'ShortAnswer', 'Email', 'MultipleChoice', 'Checkbox', 
      'Dropdown', 'Switch', 'PictureChoice'
    ]
  },
  // Used by Heading, Paragraph, ShortAnswer, Email
  text: { type: String, default: '' },
  
  // Used by Banner, PictureChoice
  image: { type: String, default: null },

  // Used by MultipleChoice, Checkbox, Dropdown, PictureChoice, Cloze
  options: [{ type: String }], 
  
  // Used by MultipleChoice, Dropdown, PictureChoice
  correctAnswer: { type: String },

  // Used by Checkbox
  correctAnswers: [{ type: String }],

  // --- Fields for 'Categorize' type ---
  categories: [{ type: String }],
  items: [{
    text: String,
    category: String 
  }],

  // --- Fields for 'Cloze' type ---
  passage: { type: String }, 

  // --- Fields for 'Comprehension' type ---
  comprehensionPassage: { type: String }, 
  mcqs: [{
    questionText: String,
    options: [String],
    correctAnswer: String
  }]
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);
export default Question;