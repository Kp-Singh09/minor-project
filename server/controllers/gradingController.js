// server/controllers/gradingController.js
import Groq from 'groq-sdk';
import Response from '../models/Response.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const evaluateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await Response.findById(submissionId).populate('formId');
    
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    // Preparing the prompt for Semantic Analysis
    const gradingPrompt = `
      As an expert AI Grader, evaluate the following student response.
      Question: "${submission.questionText}"
      Ideal Answer: "${submission.correctAnswer}"
      Student Response: "${submission.studentAnswer}"

      Provide a JSON response with:
      1. "score": (0-100) based on semantic similarity and factual accuracy.
      2. "feedback": A brief explanation of what they got right or missed.
      3. "keywordsFound": List of important technical terms they used correctly.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: gradingPrompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });

    const evaluation = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");

    // Save the AI result back to the submission
    submission.aiScore = evaluation.score;
    submission.aiFeedback = evaluation.feedback;
    submission.status = 'Graded';
    await submission.save();

    res.status(200).json(evaluation);
  } catch (error) {
    console.error("AI Grading Failed:", error);
    res.status(500).json({ message: "Neural Evaluation Error" });
  }
};