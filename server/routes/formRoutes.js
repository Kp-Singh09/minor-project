// /server/routes/formRoutes.js
import express from 'express';
import { 
    createForm, 
    addQuestionToForm, 
    getFormById, 
    updateForm, 
    getFormsByUser, 
    deleteForm,
    updateQuestion,
    deleteQuestionFromForm,
    getFormVersions,   // NEW
    rollbackToVersion  // NEW
} from '../controllers/formController.js';

const router = express.Router();

router.get('/user/:userId', getFormsByUser);
router.post('/', createForm);
router.get('/:id', getFormById);
router.put('/:id', updateForm);
router.post('/:id/questions', addQuestionToForm);
router.delete('/:id', deleteForm);

// --- VERSIONING ROUTES ---
router.get('/:id/versions', getFormVersions);
router.post('/versions/:versionId/rollback', rollbackToVersion);

// --- QUESTION ROUTES ---
router.put('/questions/:questionId', updateQuestion);
router.delete('/:formId/questions/:questionId', deleteQuestionFromForm);

export default router;