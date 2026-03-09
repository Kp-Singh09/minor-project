// server/routes/formRoutes.js
import express from 'express';
import { 
  createForm, 
  getFormById, 
  updateForm, 
  deleteForm, 
  getUserForms,
  addCollaborator,
  removeCollaborator
} from '../controllers/formController.js';

const router = express.Router();

router.post('/', createForm);
router.get('/user/:userId', getUserForms);

// Public/Secure Access
router.get('/:id', getFormById); 
router.post('/:id/access', getFormById); 

router.put('/:id', updateForm);
router.delete('/:id', deleteForm);

// Collaboration Routes
router.post('/:id/collaborators', addCollaborator);
router.delete('/:id/collaborators', removeCollaborator);

export default router;