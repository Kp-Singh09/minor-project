// server/routes/formRoutes.js
import express from 'express';
import { 
  createForm, 
  getFormById, 
  updateForm, 
  deleteForm, 
  getUserForms,
  addCollaborator,
  removeCollaborator,
  // NEW IMPORTS
  addQuestion,
  updateQuestion,
  deleteQuestion
} from '../controllers/formController.js';

const router = express.Router();

// --- Form CRUD ---
router.post('/', createForm);
router.get('/user/:userId', getUserForms);

// Public/Secure Access
router.get('/:id', getFormById); 
router.post('/:id/access', getFormById); 

router.put('/:id', updateForm);
router.delete('/:id', deleteForm);

// --- Collaboration ---
router.post('/:id/collaborators', addCollaborator);
router.delete('/:id/collaborators', removeCollaborator);

// --- NEW: Question Management Routes ---
// Matches: POST /api/forms/:id/questions
router.post('/:id/questions', addQuestion);

// Matches: PUT /api/forms/questions/:questionId
// Note: Frontend calls /api/forms/questions/${qId}, so path here is /questions/:questionId
router.put('/questions/:questionId', updateQuestion);

// Matches: DELETE /api/forms/:id/questions/:questionId
router.delete('/:id/questions/:questionId', deleteQuestion);

export default router;