// server/controllers/formController.js
import Form from '../models/Form.js';
import FormVersion from '../models/FormVersion.js';

// --- CREATE FORM ---
export const createForm = async (req, res) => {
  try {
    const { title, creatorId, questions, settings } = req.body;
    
    // Initial save (Version 1)
    const newForm = new Form({
      title,
      creatorId,
      questions, // Assuming these are ObjectIds if you pre-created them, or objects to be handled
      settings,
      version: 1
    });

    const savedForm = await newForm.save();

    // Create Initial Version Snapshot
    await FormVersion.create({
      formId: savedForm._id,
      versionNumber: 1,
      snapshot: {
        title: savedForm.title,
        questions: savedForm.questions, // This might need full population in a real app
        settings: savedForm.settings
      },
      changeLog: 'Initial Creation'
    });

    res.status(201).json(savedForm);
  } catch (error) {
    res.status(500).json({ message: 'Error creating form', error });
  }
};

// --- GET FORM BY ID (SECURE) ---
export const getFormById = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body; // Check if password is sent in body (for unlocking)

    // 1. Fetch Form (Select password explicitly to check it)
    const form = await Form.findById(id)
      .select('+settings.password') 
      .populate('questions');

    if (!form) return res.status(404).json({ message: 'Form not found' });

    // 2. Check Expiration (TTL)
    if (form.settings?.expiresAt && new Date() > new Date(form.settings.expiresAt)) {
      return res.status(410).json({ 
        message: 'This form has expired and is no longer accepting responses.',
        isExpired: true 
      });
    }

    // 3. Security Check: Password Protection
    const isProtected = form.settings?.privacy === 'protected';
    
    if (isProtected) {
      // If no password provided OR password doesn't match
      if (!password || password !== form.settings.password) {
        // Return "Locked" state - DO NOT send questions
        return res.status(200).json({
          _id: form._id,
          title: form.title,
          isLocked: true,
          requiresPassword: true,
          headerImage: form.headerImage
        });
      }
    }

    // 4. If Public or Password Verified -> Return Full Data
    // Remove sensitive data before sending
    const formPayload = form.toObject();
    if (formPayload.settings && formPayload.settings.password) {
      delete formPayload.settings.password; 
    }

    res.status(200).json(formPayload);

  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: 'Server Error', error });
  }
};

// --- UPDATE FORM (With Versioning) ---
export const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const form = await Form.findById(id);
    if (!form) return res.status(404).json({ message: 'Form not found' });

    // Auto-Increment Version
    const newVersion = (form.version || 1) + 1;
    updateData.version = newVersion;

    const updatedForm = await Form.findByIdAndUpdate(id, updateData, { new: true });

    // Create Version Snapshot
    await FormVersion.create({
      formId: form._id,
      versionNumber: newVersion,
      snapshot: {
        title: updatedForm.title,
        questions: updatedForm.questions,
        settings: updatedForm.settings
      },
      changeLog: 'Update via Editor'
    });

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
    res.status(200).json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting form', error });
  }
};

// --- GET USER FORMS ---
export const getUserForms = async (req, res) => {
    try {
        const { userId } = req.params;
        const forms = await Form.find({ creatorId: userId }).sort({ createdAt: -1 });
        res.status(200).json(forms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user forms', error });
    }
};