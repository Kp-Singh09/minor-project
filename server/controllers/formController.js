// server/controllers/formController.js
import Form from '../models/Form.js';
import FormVersion from '../models/FormVersion.js';
import Question from '../models/Question.js';

// --- CREATE FORM ---
export const createForm = async (req, res) => {
  try {
    const { title, userId, username, questions, settings } = req.body;
    
    const newForm = new Form({
      title,
      creatorId: userId,
      username: username || 'Anonymous',
      questions: questions || [],
      settings: settings || {},
      version: 1,
      collaborators: []
    });

    const savedForm = await newForm.save();

    // Initial Version Snapshot
    await FormVersion.create({
      formId: savedForm._id,
      versionNumber: 1,
      snapshot: {
        title: savedForm.title,
        questions: savedForm.questions, 
        settings: savedForm.settings
      },
      changeLog: 'Initial Creation'
    });

    res.status(201).json(savedForm);
  } catch (error) {
    res.status(500).json({ message: 'Error creating form', error });
  }
};

// --- GET FORM BY ID ---
export const getFormById = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, userId } = req.body; 

    const form = await Form.findById(id)
      .select('+settings.password') 
      .populate('questions');

    if (!form) return res.status(404).json({ message: 'Form not found' });

    // Creator Bypass
    if (form.creatorId === userId) {
        return res.status(200).json(form);
    }

    // Expiration Check
    if (form.settings?.expiresAt && new Date() > new Date(form.settings.expiresAt)) {
      return res.status(410).json({ message: 'Form expired.', isExpired: true });
    }

    // Password Check
    if (form.settings?.privacy === 'protected') {
      if (!password || password !== form.settings.password) {
        return res.status(200).json({
          _id: form._id,
          title: form.title,
          isLocked: true,
          requiresPassword: true,
          headerImage: form.headerImage
        });
      }
    }

    const formPayload = form.toObject();
    if (formPayload.settings?.password) delete formPayload.settings.password;

    res.status(200).json(formPayload);

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// --- UPDATE FORM METADATA ---
export const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const form = await Form.findById(id);
    if (!form) return res.status(404).json({ message: 'Form not found' });

    const updatedForm = await Form.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updatedForm);
  } catch (error) {
    res.status(500).json({ message: 'Error updating form', error });
  }
};

// --- DELETE FORM ---
export const deleteForm = async (req, res) => {
  try {
    const { id } = req.params;
    await Form.findByIdAndDelete(id);
    // Optional: Delete associated questions too
    // await Question.deleteMany({ formId: id });
    res.status(200).json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting form', error });
  }
};

// --- GET USER FORMS ---
export const getUserForms = async (req, res) => {
    try {
        const { userId } = req.params;
        // FIX: Added .populate('questions') so the frontend FormCard can read the question type
        const forms = await Form.find({ creatorId: userId })
            .populate('questions')
            .sort({ createdAt: -1 });
        res.status(200).json(forms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user forms', error });
    }
};

// --- COLLABORATION ---
export const addCollaborator = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role } = req.body;
        const form = await Form.findById(id);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        if (form.collaborators.find(c => c.email === email)) {
            return res.status(400).json({ message: 'User already added' });
        }

        form.collaborators.push({ email, role });
        await form.save();
        res.status(200).json(form.collaborators);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add collaborator' });
    }
};

export const removeCollaborator = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body; 
        const form = await Form.findById(id);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        form.collaborators = form.collaborators.filter(c => c.email !== email);
        await form.save();
        res.status(200).json(form.collaborators);
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove collaborator' });
    }
};

// ==========================================
// NEW: QUESTION MANAGEMENT (Fixes 404 Error)
// ==========================================

// POST /api/forms/:id/questions
export const addQuestion = async (req, res) => {
    try {
        const { id } = req.params; // Form ID
        const questionData = req.body; // Question Content

        const form = await Form.findById(id);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        // Create new Question
        const newQuestion = new Question({
            formId: id,
            ...questionData
        });
        const savedQuestion = await newQuestion.save();

        // Link to Form
        form.questions.push(savedQuestion._id);
        await form.save();

        res.status(201).json(savedQuestion);
    } catch (error) {
        console.error("Add Question Error:", error);
        res.status(500).json({ message: 'Failed to add question', error });
    }
};

// PUT /api/forms/questions/:questionId
export const updateQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const updateData = req.body;

        const updatedQuestion = await Question.findByIdAndUpdate(
            questionId, 
            updateData, 
            { new: true }
        );

        if (!updatedQuestion) return res.status(404).json({ message: 'Question not found' });

        res.status(200).json(updatedQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update question', error });
    }
};

// DELETE /api/forms/:id/questions/:questionId
export const deleteQuestion = async (req, res) => {
    try {
        const { id, questionId } = req.params;

        // Remove from Question Collection
        await Question.findByIdAndDelete(questionId);

        // Remove reference from Form
        await Form.findByIdAndUpdate(id, {
            $pull: { questions: questionId }
        });

        res.status(200).json({ message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete question', error });
    }
};