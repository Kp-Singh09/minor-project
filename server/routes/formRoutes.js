// server/routes/formRoutes.js
import express from 'express';
import { 
  createForm, 
  getFormById, 
  updateForm, 
  deleteForm, 
  getUserForms 
} from '../controllers/formController.js';

const router = express.Router();

router.post('/', createForm);
router.get('/user/:userId', getUserForms);

// Public Access Routes
router.get('/:id', getFormById); // Standard fetch
router.post('/:id/access', getFormById); // Fetch with Password (POST allows body)

router.put('/:id', updateForm);
router.delete('/:id', deleteForm);

export default router;