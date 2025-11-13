// server/controllers/formController.js
import Form from '../models/Form.js';
import Question from '../models/Question.js';
import Response from '../models/Response.js';

// ... (updateQuestion, deleteQuestionFromForm, deleteForm, getFormsByUser, updateForm... keep all of them as they are) ...
export const updateQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const questionData = req.body;
        const updatedQuestion = await Question.findByIdAndUpdate(questionId, questionData, { new: true });
        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json(updatedQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Could not update question', error });
    }
};

export const deleteQuestionFromForm = async (req, res) => {
    try {
        const { formId, questionId } = req.params;
        await Form.findByIdAndUpdate(formId, { $pull: { questions: questionId } });
        await Question.findByIdAndDelete(questionId);
        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Could not delete question', error });
    }
};

export const deleteForm = async (req, res) => {
    try {
        const { id } = req.params;
        const form = await Form.findById(id);
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }
        if (form.questions && form.questions.length > 0) {
            await Question.deleteMany({ _id: { $in: form.questions } });
        }
        await Response.deleteMany({ formId: id });
        await Form.findByIdAndDelete(id);
        res.status(200).json({ message: 'Form and all associated data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Could not delete form', error });
    }
};

export const getFormsByUser = async (req, res) => {
  try {
    const forms = await Form.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Could not retrieve forms' });
  }
};

export const updateForm = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, headerImage, theme } = req.body;
        const form = await Form.findById(id);
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }
        if (title) form.title = title;
        if (headerImage) form.headerImage = headerImage;
        if (theme) form.theme = theme;
        const updatedForm = await form.save();
        res.status(200).json(updatedForm);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Could not update form', error });
    }
};
  
// @desc    Create a new form
// @route   POST /api/forms
// @access  Private
// --- V V V THIS IS THE MODIFIED FUNCTION V V V ---
export const createForm = async (req, res) => {
  try {
    // 1. Destructure all possible fields
    const { title, userId, username, theme, questions: templateQuestions } = req.body; 

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required to create a form.' });
    }

    // 2. Create the Form document
    const newForm = new Form({
      title: title || 'My New Form',
      userId: userId,
      username: username || 'Anonymous',
      theme: theme || 'Light', // Use 'Light' as the default
      questions: [], // Start with an empty array
    });

    // 3. Check if template questions were provided
    if (templateQuestions && Array.isArray(templateQuestions) && templateQuestions.length > 0) {
      const questionIds = [];
      for (const qData of templateQuestions) {
        // Create a new Question document for each question in the template
        const newQuestion = new Question({
          type: qData.type,
          text: qData.text,
          // Display types
          image: qData.image,
          // Choice types
          options: qData.options,
          correctAnswer: qData.correctAnswer,
          correctAnswers: qData.correctAnswers,
          // Complex types
          categories: qData.categories,
          items: qData.items,
          passage: qData.passage,
          comprehensionPassage: qData.comprehensionPassage,
          mcqs: qData.mcqs,
        });
        await newQuestion.save();
        questionIds.push(newQuestion._id);
      }
      // 4. Add the new question IDs to the form
      newForm.questions = questionIds;
    }

    // 5. Save the new form (with or without questions)
    await newForm.save();
    
    // 6. Return the new form
    res.status(201).json(newForm); 
    
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ message: 'Server Error: Could not create form', error: error.message });
  }
};
// --- ^ ^ ^ THIS IS THE MODIFIED FUNCTION ^ ^ ^ ---


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