// server/models/FormVersion.js
import mongoose from 'mongoose';

const formVersionSchema = new mongoose.Schema({
  formId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Form', 
    required: true 
  },
  versionNumber: { 
    type: Number, 
    required: true 
  },
  snapshot: {
    title: String,
    questions: [mongoose.Schema.Types.Mixed], // Stores full question objects
    settings: mongoose.Schema.Types.Mixed
  },
  changeLog: { 
    type: String, 
    default: 'Manual Save' 
  }
}, { timestamps: true });

export default mongoose.model('FormVersion', formVersionSchema);