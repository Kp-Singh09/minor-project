// server/controllers/formController.js
import Form from '../models/Form.js';
import Question from '../models/Question.js';
import Response from '../models/Response.js';
import FormVersion from '../models/FormVersion.js'; // NEW

export const updateQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const questionData = req.body;
        const updatedQuestion = await Question.findByIdAndUpdate(questionId, questionData, { new: true });
        if (!updatedQuestion) return res.status(404).json({ message: 'Question not found' });
        res.status(200).json(updatedQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const deleteQuestionFromForm = async (req, res) => {
    try {
        const { formId, questionId } = req.params;
        await Form.findByIdAndUpdate(formId, { $pull: { questions: questionId } });
        await Question.findByIdAndDelete(questionId);
        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const deleteForm = async (req, res) => {
    try {
        const { id } = req.params;
        const form = await Form.findById(id);
        if (!form) return res.status(404).json({ message: 'Form not found' });
        if (form.questions && form.questions.length > 0) {
            await Question.deleteMany({ _id: { $in: form.questions } });
        }
        await Response.deleteMany({ formId: id });
        await FormVersion.deleteMany({ formId: id }); // NEW: Clean up versions
        await Form.findByIdAndDelete(id);
        res.status(200).json({ message: 'Form deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const getFormsByUser = async (req, res) => {
  try {
    const forms = await Form.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateForm = async (req, res) => {
  try {
      const { id } = req.params;
      const { title, headerImage, theme, questions, settings } = req.body;
      const form = await Form.findById(id).populate('questions');
      if (!form) return res.status(404).json({ message: 'Form not found' });

      // Versioning Snapshot logic
      const versionSnapshot = new FormVersion({
          formId: id,
          versionNumber: (form.version || 1),
          snapshot: {
              title: form.title,
              questions: form.questions,
              settings: form.settings
          }
      });
      await versionSnapshot.save();

      if (title) form.title = title;
      if (headerImage !== undefined) form.headerImage = headerImage;
      if (theme) form.theme = theme;
      if (questions) form.questions = questions;
      
      // NEW: Granular Settings Update for RBAC & TTL
      if (settings) {
          form.settings = {
              ...form.settings,
              ...settings
          };
      }
      
      form.version = (form.version || 1) + 1;
      await form.save();
      
      const updatedForm = await Form.findById(id).populate('questions');
      res.status(200).json(updatedForm);
  } catch (error) {
      res.status(500).json({ message: 'Server Error', error });
  }
};

// NEW: RBAC Middleware logic placeholder (can be expanded in middleware/auth.js)
export const verifyAccess = async (req, res, next) => {
  try {
      const form = await Form.findById(req.params.id);
      if (!form) return res.status(404).json({ message: 'Form not found' });

      // Check for TTL Expiration
      if (form.settings?.expiresAt && new Date() > new Date(form.settings.expiresAt)) {
          return res.status(403).json({ message: 'This form link has expired.' });
      }

      // Logic for checking User Roles would go here (integrating with Clerk userId)
      next();
  } catch (error) {
      res.status(500).json({ message: 'Access check failed' });
  }
};

// NEW: Rollback Logic
export const rollbackToVersion = async (req, res) => {
    try {
        const { versionId } = req.params;
        const version = await FormVersion.findById(versionId);
        if (!version) return res.status(404).json({ message: 'Version not found' });

        const form = await Form.findById(version.formId);
        
        // Restore from snapshot
        form.title = version.snapshot.title;
        form.settings = version.snapshot.settings;
        // Logic for question restoration would follow here
        
        await form.save();
        res.status(200).json({ message: 'Rollback successful', form });
    } catch (error) {
        res.status(500).json({ message: 'Rollback failed', error });
    }
};
  
export const createForm = async (req, res) => {
  try {
    const { title, userId, username, theme, questions: templateQuestions } = req.body; 
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const newForm = new Form({
      title: title || 'My New Form',
      userId: userId,
      username: username || 'Anonymous',
      theme: theme || 'Light',
      questions: [],
      version: 1 // Initialize version
    });

    if (templateQuestions && Array.isArray(templateQuestions)) {
      const questionIds = [];
      for (const qData of templateQuestions) {
        const newQuestion = new Question({ ...qData, formId: newForm._id });
        await newQuestion.save();
        questionIds.push(newQuestion._id);
      }
      newForm.questions = questionIds;
    }

    const savedForm = await newForm.save();
    res.status(201).json(await Form.findById(savedForm._id).populate('questions'));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const addQuestionToForm = async (req, res) => {
    try {
      const form = await Form.findById(req.params.id);
      if (!form) return res.status(404).json({ message: 'Form not found' });
      const newQuestion = new Question({ ...req.body, formId: form._id });
      await newQuestion.save();
      form.questions.push(newQuestion._id);
      await form.save();
      res.status(201).json(newQuestion);
    } catch (error) {
      res.status(500).json({ message: 'Server Error' });
    }
};

export const getFormById = async (req, res) => {
    try {
      const form = await Form.findById(req.params.id).populate('questions');
      if (!form) return res.status(404).json({ message: 'Form not found' });
      res.status(200).json(form);
    } catch (error) {
      res.status(500).json({ message: 'Server Error' });
    }
};

// NEW: Fetch all versions for a form
export const getFormVersions = async (req, res) => {
    try {
        const versions = await FormVersion.find({ formId: req.params.id }).sort({ createdAt: -1 });
        res.status(200).json(versions);
    } catch (error) {
        res.status(500).json({ message: 'Could not fetch versions' });
    }
};