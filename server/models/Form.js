// /server/models/Form.js
import mongoose from 'mongoose';

const formSchema = new mongoose.Schema({
  // --- ADD THIS LINE ---
  userId: { type: String, required: true },
  username: { type: String, default: 'Anonymous' },
  title: { type: String, default: 'Untitled Form' },
  headerImage: { type: String, default: null }, 
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Response' }],
  createdAt: { type: Date, default: Date.now },
});

const Form = mongoose.model('Form', formSchema);
export default Form;