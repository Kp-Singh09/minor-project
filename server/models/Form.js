// server/models/Form.js
import mongoose from 'mongoose';

const formSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true
  },
  headerImage: { 
    type: String 
  },
  creatorId: { 
    type: String, 
    required: true
  },
  questions: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question'
  }],
  // NEW: Production-Grade System Fields
  isPublished: { 
    type: Boolean, 
    default: false 
  },
  version: { 
    type: Number, 
    default: 1 
  },
  settings: {
    password: { 
      type: String, 
      select: false // Password won't be sent in standard queries
    },
    expiresAt: { 
      type: Date // For TTL auto-expiring links
    },
    allowedRoles: { 
      type: [String], 
      default: ['viewer'] // For granular RBAC
    }
  }
}, { timestamps: true });

export default mongoose.model('Form', formSchema);