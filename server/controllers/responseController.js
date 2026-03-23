// server/controllers/responseController.js
import Response from '../models/Response.js';
import Form from '../models/Form.js';
import Question from '../models/Question.js';

export const getResponsesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const responses = await Response.find({ userId })
            .populate({
                path: 'formId',
                model: 'Form',
                select: 'title'
            })
            .sort({ submittedAt: -1 });
        res.status(200).json(responses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const getSingleResponseById = async (req, res) => {
  try {
    const { responseId } = req.params;
    const response = await Response.findById(responseId).populate({
      path: 'answers.questionId',
      model: 'Question'
    });
    if (!response) return res.status(404).json({ message: 'Response not found' });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const getResponsesByFormId = async (req, res) => {
    try {
      const { formId } = req.params;
      const responses = await Response.find({ formId }).populate({
        path: 'answers.questionId',
        model: 'Question'
      });
      if (!responses) return res.status(404).json({ message: 'No responses found' });
      res.status(200).json(responses);
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error });
    }
};

export const createResponse = async (req, res) => {
  try {
    const { formId, answers, userId, userEmail, username, integrityFlags } = req.body; 

    if (!userId || !userEmail) {
      return res.status(400).json({ message: 'User details are required.' });
    }

    const form = await Form.findById(formId).populate('questions');
    if (!form) return res.status(404).json({ message: 'Form not found' });

    let totalScore = 0;
    const marksPerQuestion = 10; // Default weight per question
    
    // UI elements and generic inputs are excluded from objective scoring
    const SCORABLE_TYPES = [
      'Comprehension', 'Categorize', 'Cloze', 
      'MultipleChoice', 'Checkbox', 'Dropdown', 'PictureChoice', 'ShortAnswer'
    ];
    
    const scorableQuestions = form.questions.filter(q => SCORABLE_TYPES.includes(q.type));
    const totalMarks = scorableQuestions.length * marksPerQuestion;
    
    const processedAnswers = []; 

    for (const submittedAnswer of answers) {
      const question = form.questions.find(q => q._id.toString() === submittedAnswer.questionId);
      if (!question) continue;

      let questionScore = 0;
      const qContent = question.content || {}; // ALL data lives inside content
      const userAnswer = submittedAnswer.answer;
      
      if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
        switch (question.type) {
          case 'Comprehension':
            if (qContent.mcqs && qContent.mcqs.length > 0) {
              const pointsPerMcq = marksPerQuestion / qContent.mcqs.length;
              qContent.mcqs.forEach(mcq => {
                if (userAnswer[mcq._id?.toString()] === mcq.correctAnswer) {
                  questionScore += pointsPerMcq;
                }
              });
            }
            break;
            
          case 'Categorize':
            if (qContent.items && qContent.items.length > 0) {
              const pointsPerItem = marksPerQuestion / qContent.items.length;
              qContent.items.forEach(item => {
                // Find which category the user placed this item in
                const submittedCategory = Object.keys(userAnswer).find(cat => 
                  Array.isArray(userAnswer[cat]) && userAnswer[cat].includes(item.text)
                );
                if (submittedCategory === item.category) {
                  questionScore += pointsPerItem;
                }
              });
            }
            break;

          case 'Cloze':
            // Assuming options array holds the correct blanks in order
            const correctClozeAnswers = qContent.options || [];
            if (correctClozeAnswers.length > 0) {
              const pointsPerBlank = marksPerQuestion / correctClozeAnswers.length;
              for (let i = 0; i < correctClozeAnswers.length; i++) {
                if (String(userAnswer[`blank_${i}`]).trim().toLowerCase() === String(correctClozeAnswers[i]).trim().toLowerCase()) {
                  questionScore += pointsPerBlank;
                }
              }
            }
            break;

          case 'MultipleChoice':
          case 'Dropdown':
          case 'PictureChoice':
          case 'ShortAnswer':
            if (String(userAnswer).trim().toLowerCase() === String(qContent.correctAnswer || '').trim().toLowerCase()) {
              questionScore = marksPerQuestion;
            }
            break;

          case 'Checkbox':
            const userAnsArr = Array.isArray(userAnswer) ? [...userAnswer].sort() : [];
            const correctAnsArr = Array.isArray(qContent.correctAnswers) ? [...qContent.correctAnswers].sort() : [];
            
            if (JSON.stringify(userAnsArr) === JSON.stringify(correctAnsArr)) {
              questionScore = marksPerQuestion;
            }
            break;
        }
      }

      totalScore += questionScore;
      processedAnswers.push({
        ...submittedAnswer,
        points: Math.round(questionScore) // Save calculated points
      });
    }

    const newResponse = new Response({
      formId,
      answers: processedAnswers, 
      userId,
      userEmail,
      username: username || 'Anonymous',
      score: Math.round(totalScore),
      totalMarks,
      integrityFlags: integrityFlags || []
    });
    
    const savedResponse = await newResponse.save();
    form.responses.push(savedResponse._id);
    await form.save();

    res.status(201).json({ message: 'Response submitted!', responseId: savedResponse._id });
  } catch (error) {
    console.error("Scoring Error:", error);
    res.status(500).json({ message: 'Server Error', error });
  }
};