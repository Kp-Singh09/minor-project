// server/models/Form.js
import mongoose from 'mongoose';

const formSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  headerImage: { type: String },
  theme: { type: String, default: 'default' },
  
  // Creator Info
  creatorId: { type: String, required: true }, // Clerk User ID
  username: { type: String },
  
  // Questions Link
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  
  // Responses Link
  responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Response' }],
  
  // Settings & Security
  settings: {
    privacy: { type: String, enum: ['public', 'private', 'protected'], default: 'public' },
    password: { type: String, select: false }, // Not returned by default
    expiresAt: { type: Date },
    limitOneResponse: { type: Boolean, default: false }
  },

  // NEW: RBAC / Collaboration
  collaborators: [{
    email: { type: String, required: true },
    role: { type: String, enum: ['Editor', 'Viewer'], default: 'Editor' },
    addedAt: { type: Date, default: Date.now }
  }],

  // Version Control
  version: { type: Number, default: 1 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Form = mongoose.model('Form', formSchema);
export default Form;