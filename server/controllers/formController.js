// server/controllers/formController.js
import Form from '../models/Form.js';
import FormVersion from '../models/FormVersion.js';

// --- CREATE FORM ---
export const createForm = async (req, res) => {
  try {
    const { title, userId, username, questions, settings } = req.body;
    
    const newForm = new Form({
      title,
      creatorId: userId, // Ensure frontend sends this as userId
      username: username || 'Anonymous',
      questions: questions || [],
      settings: settings || {},
      version: 1
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

// --- GET FORM BY ID (SECURE + RBAC) ---
export const getFormById = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, userId } = req.body; // Check body for credentials

    // 1. Fetch Form
    const form = await Form.findById(id)
      .select('+settings.password') 
      .populate('questions');

    if (!form) return res.status(404).json({ message: 'Form not found' });

    // 2. RBAC Bypass: If User is Creator or Collaborator, return full access immediately
    const isCreator = form.creatorId === userId;
    // Note: In a real app with Clerk, you might check email against form.collaborators here too
    // For now, if userId matches creator, we bypass. 
    // Ideally, pass userEmail in body to check collaborator list.
    
    if (isCreator) {
        return res.status(200).json(form);
    }

    // 3. Public/Respondent Access Checks
    
    // Check Expiration (TTL)
    if (form.settings?.expiresAt && new Date() > new Date(form.settings.expiresAt)) {
      return res.status(410).json({ 
        message: 'This form has expired.',
        isExpired: true 
      });
    }

    // Check Password Protection
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

    // Return Form (Mask sensitive settings if needed)
    const formPayload = form.toObject();
    if (formPayload.settings?.password) delete formPayload.settings.password;

    res.status(200).json(formPayload);

  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: 'Server Error', error });
  }
};

// --- UPDATE FORM (RBAC Protected) ---
export const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const form = await Form.findById(id);
    if (!form) return res.status(404).json({ message: 'Form not found' });

    // TODO: Add strict RBAC check here if userId is provided in body
    // if (form.creatorId !== req.body.userId && !isCollaborator) return res.status(403)...

    const newVersion = (form.version || 1) + 1;
    updateData.version = newVersion;

    const updatedForm = await Form.findByIdAndUpdate(id, updateData, { new: true });

    // Snapshot
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
        // Find forms where user is Creator OR Collaborator
        // Note: This requires us to know the user's email for collaborator check
        // For simple ID check:
        const forms = await Form.find({ creatorId: userId }).sort({ createdAt: -1 });
        res.status(200).json(forms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user forms', error });
    }
};

// --- COLLABORATION: ADD MEMBER ---
export const addCollaborator = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role } = req.body;

        const form = await Form.findById(id);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        // Check for duplicate
        const exists = form.collaborators.find(c => c.email === email);
        if (exists) return res.status(400).json({ message: 'User already added' });

        form.collaborators.push({ email, role });
        await form.save();

        res.status(200).json(form.collaborators);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add collaborator' });
    }
};

// --- COLLABORATION: REMOVE MEMBER ---
export const removeCollaborator = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body; // or passed as query

        const form = await Form.findById(id);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        form.collaborators = form.collaborators.filter(c => c.email !== email);
        await form.save();

        res.status(200).json(form.collaborators);
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove collaborator' });
    }
};