// server/controllers/formController.js
import Form from '../models/Form.js';
import Question from '../models/Question.js';
import Response from '../models/Response.js'; // Import the Response model

// --- NEW DELETE FUNCTION ---
// @desc    Delete a form and all its associated data
// @route   DELETE /api/forms/:id
// @access  Private
export const deleteForm = async (req, res) => {
    try {
        const { id } = req.params;
        const form = await Form.findById(id);

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        // Delete all questions associated with the form
        if (form.questions && form.questions.length > 0) {
            await Question.deleteMany({ _id: { $in: form.questions } });
        }

        // Delete all responses associated with the form
        await Response.deleteMany({ formId: id });

        // Finally, delete the form itself
        await Form.findByIdAndDelete(id);

        res.status(200).json({ message: 'Form and all associated data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Could not delete form', error });
    }
};

// @desc    Get all forms for a specific user
// @route   GET /api/forms/user/:userId
// @access  Private
export const getFormsByUser = async (req, res) => {
  try {
    const forms = await Form.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Could not retrieve forms' });
  }
};

// @desc    Update form title or header image
// @route   PUT /api/forms/:id
// @access  Private
export const updateForm = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, headerImage } = req.body;
        const form = await Form.findById(id);
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }
        if (title) form.title = title;
        if (headerImage) form.headerImage = headerImage;
        const updatedForm = await form.save();
        res.status(200).json(updatedForm);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Could not update form', error });
    }
};
  
// @desc    Create a new form
// @route   POST /api/forms
// @access  Private
export const createForm = async (req, res) => {
  try {
    const { title, userId, username } = req.body; 
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required to create a form.' });
    }
    const form = new Form({
      title: title || 'My New Form',
      userId: userId,
      username: username || 'Anonymous'
    });
    const newForm = await form.save();
    res.status(201).json(newForm);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Could not create form', error });
  }
};

// @desc    Add a question to a form
// @route   POST /api/forms/:id/questions
// @access  Private
export const addQuestionToForm = async (req, res) => {
    try {
      const form = await Form.findById(req.params.id);
      if (!form) {
        return res.status(404).json({ message: 'Form not found' });
      }
      const questionData = req.body;
      const newQuestion = new Question(questionData);
      await newQuestion.save();
      form.questions.push(newQuestion._id);
      await form.save();
      res.status(201).json(newQuestion);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error: Could not add question' });
    }
};

// @desc    Get a single form by its ID
// @route   GET /api/forms/:id
// @access  Public
export const getFormById = async (req, res) => {
    try {
      const form = await Form.findById(req.params.id).populate('questions');
      if (!form) {
        return res.status(404).json({ message: 'Form not found' });
      }
      res.status(200).json(form);
    } catch (error) {
      res.status(500).json({ message: 'Server Error: Could not retrieve form' });
    }
};