// /server/routes/formRoutes.js
import express from 'express';
// --- IMPORT THE NEW CONTROLLER ---
import { createForm, addQuestionToForm, getFormById, updateForm, getFormsByUser, deleteForm } from '../controllers/formController.js';

const router = express.Router();

router.get('/user/:userId', getFormsByUser);
router.post('/', createForm);
router.get('/:id', getFormById);
router.put('/:id', updateForm);
router.post('/:id/questions', addQuestionToForm);
router.delete('/:id', deleteForm); // --- ADD THIS NEW ROUTE ---

export default router;