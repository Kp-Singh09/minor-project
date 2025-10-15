// server/controllers/responseController.js
import Response from '../models/Response.js';
import Form from '../models/Form.js';
import Question from '../models/Question.js';

// ... (getResponsesByUserId, getSingleResponseById, getResponsesByFormId remain the same)
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
        res.status(500).json({ message: 'Server Error: Could not retrieve user responses', error });
    }
};

export const getSingleResponseById = async (req, res) => {
  try {
    const { responseId } = req.params;
    const response = await Response.findById(responseId).populate({
      path: 'answers.questionId',
      model: 'Question'
    });
    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Could not retrieve response', error });
  }
};

export const getResponsesByFormId = async (req, res) => {
    try {
      const { formId } = req.params;
      const responses = await Response.find({ formId }).populate({
        path: 'answers.questionId',
        model: 'Question'
      });
      if (!responses) {
        return res.status(404).json({ message: 'No responses found for this form' });
      }
      res.status(200).json(responses);
    } catch (error) {
      res.status(500).json({ message: 'Server Error: Could not retrieve responses', error });
    }
  };


  export const createResponse = async (req, res) => {
    try {
      const { formId, answers, userId, userEmail } = req.body;
  
      if (!userId || !userEmail) {
        return res.status(400).json({ message: 'User details are required.' });
      }
  
      const form = await Form.findById(formId).populate('questions');
      if (!form) {
        return res.status(404).json({ message: 'Form not found' });
      }
  
      let totalScore = 0;
      const totalMarks = form.questions.length * 10;
      const marksPerQuestion = 10;
      const processedAnswers = []; // To store answers with their calculated points
  
      for (const submittedAnswer of answers) {
        const question = form.questions.find(q => q._id.toString() === submittedAnswer.questionId);
        if (!question) continue;
  
        let questionScore = 0;
        switch (question.type) {
          case 'Comprehension':
            if (question.mcqs && question.mcqs.length > 0) {
              const pointsPerMcq = marksPerQuestion / question.mcqs.length;
              question.mcqs.forEach(mcq => {
                if (submittedAnswer.answer[mcq._id.toString()] === mcq.correctAnswer) {
                  questionScore += pointsPerMcq;
                }
              });
            }
            break;
          
          case 'Categorize':
            if (question.items && question.items.length > 0) {
              const pointsPerItem = marksPerQuestion / question.items.length;
              question.items.forEach(item => {
                const submittedCategory = Object.keys(submittedAnswer.answer).find(cat => 
                  Array.isArray(submittedAnswer.answer[cat]) && submittedAnswer.answer[cat].includes(item.text)
                );
                if (submittedCategory === item.category) {
                  questionScore += pointsPerItem;
                }
              });
            }
            break;
            
          case 'Cloze':
            const correctClozeAnswers = question.options;
            if (correctClozeAnswers && correctClozeAnswers.length > 0) {
              const pointsPerBlank = marksPerQuestion / correctClozeAnswers.length;
              for (let i = 0; i < correctClozeAnswers.length; i++) {
                if (submittedAnswer.answer[`blank_${i}`] === correctClozeAnswers[i]) {
                  questionScore += pointsPerBlank;
                }
              }
            }
            break;
        }
  
        totalScore += questionScore;
        processedAnswers.push({
          ...submittedAnswer,
          points: Math.round(questionScore) // Save the calculated points for this answer
        });
      }
  
      const newResponse = new Response({
        formId,
        answers: processedAnswers, // Use the new array with points
        userId,
        userEmail,
        score: Math.round(totalScore),
        totalMarks
      });
      
      const savedResponse = await newResponse.save();
      form.responses.push(savedResponse._id);
      await form.save();
  
      res.status(201).json({ message: 'Response submitted successfully!', responseId: savedResponse._id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error: Could not submit response', error });
    }
  };