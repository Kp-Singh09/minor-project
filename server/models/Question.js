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
      // Simple Input Types
      'ShortAnswer', 'Email', 'MultipleChoice', 'Checkbox', 
      'Dropdown', 'Switch', 'PictureChoice',
      'LongAnswer' // <-- ADD THIS LINE
    ]
  },
  // Used by Heading, Paragraph, ShortAnswer, Email, LongAnswer
  text: { type: String, default: '' },
  
  // ... (rest of the file is unchanged)
  image: { type: String, default: null },
  options: [{ type: String }], 
  correctAnswer: { type: String },
  correctAnswers: [{ type: String }],
  categories: [{ type: String }],
  items: [{
    text: String,
    category: String 
  }],
  passage: { type: String }, 
  comprehensionPassage: { type: String }, 
  mcqs: [{
    questionText: String,
    options: [String],
    correctAnswer: String
  }]
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);
export default Question;