import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Categorize', 'Cloze', 'Comprehension']
  },
  title: { type: String },
  // This will store the URL from ImageKit for a specific question
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