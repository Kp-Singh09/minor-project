// server/controllers/aiController.js
import Groq from 'groq-sdk';
import Form from '../models/Form.js';
import Question from '../models/Question.js';

// This is the most important part.
// We are "prompt engineering" to force the AI to return JSON
// in the exact structure our database models expect.
const getSystemPrompt = () => {
  return `
    You are an expert quiz creator. A user will provide a topic, and you must generate a quiz about it.
    You must respond ONLY with a single JSON object in the exact structure requested, with no other text or markdown.
    
    The JSON object must have this structure:
    {
      "title": "Your Generated Quiz Title",
      "questions": [
        {
          "type": "MultipleChoice",
          "text": "Your question text?",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": "The correct option text"
        },
        {
          "type": "Comprehension",
          "comprehensionPassage": "A short passage (2-4 sentences) for the user to read.",
          "mcqs": [
            {
              "questionText": "First question about the passage?",
              "options": ["Option 1", "Option 2", "Option 3"],
              "correctAnswer": "The correct option text"
            },
            {
              "questionText": "Second question about the passage?",
              "options": ["Option A", "Option B", "Option C"],
              "correctAnswer": "The correct option text"
            }
          ]
        },
        {
          "type": "Categorize",
          "categories": ["Category A", "Category B"],
          "items": [
            { "text": "Item 1", "category": "Category A" },
            { "text": "Item 2", "category": "Category B" },
            { "text": "Item 3", "category": "Category A" }
          ]
        }
      ]
    }

    Rules:
    - Respond with a single, minified JSON object.
    - Do NOT use markdown (like \`\`\`json).
    - ONLY use the question types: "MultipleChoice", "Comprehension", "Categorize".
    - Do not use "ShortAnswer", "Heading", "Paragraph", "Banner", "Email", "Checkbox", "Dropdown", "Switch", "PictureChoice", or "Cloze".
    - Create between 3 and 7 questions total.
    - For "Comprehension" questions, you MUST generate at least 2 distinct multiple-choice questions ('mcqs') inside the 'mcqs' array.
    - Ensure 'correctAnswer' for MultipleChoice exactly matches one of the strings in 'options'.
  `;
};

export const generateFormWithAI = async (req, res) => {
  // We receive userId from the frontend
  const { prompt, userId, username } = req.body; 
  
  if (!prompt || !userId) {
      return res.status(400).json({ message: 'Prompt and User ID are required.' });
  }
  
  try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const chatCompletion = await groq.chat.completions.create({
          messages: [
              { role: "system", content: getSystemPrompt() },
              { role: "user", content: `User prompt: "${prompt}"` }
          ],
          model: "llama-3.1-8b-instant",
          response_format: { type: "json_object" }
      });

      const aiResponse = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");

      // 1. Create the Form
      const newForm = new Form({
          title: aiResponse.title || 'AI Generated Assessment',
          // FIXED: Changed userId to creatorId to match Form.js schema
          creatorId: userId, 
          username: username || 'AI User',
          theme: 'Light',
          questions: []
      });
      
      const savedForm = await newForm.save();

      const questionIds = [];

      // 2. Map AI response to Question Schema
      for (const qData of aiResponse.questions) {
          const newQuestion = new Question({
              formId: savedForm._id, 
              type: qData.type,
              content: {
                  question: qData.text || qData.questionText || "",
                  options: qData.options || [],
                  correctAnswer: qData.correctAnswer || "",
                  categories: qData.categories || [],
                  items: qData.items || [],
                  comprehensionPassage: qData.comprehensionPassage || "",
                  mcqs: qData.mcqs || []
              }
          });
          
          const savedQuestion = await newQuestion.save();
          questionIds.push(savedQuestion._id);
      }

      // 3. Update Form with Question IDs
      savedForm.questions = questionIds;
      await savedForm.save();

      res.status(201).json({ formId: savedForm._id });

  } catch (error) {
      console.error("AI generation or database creation failed:", error);
      res.status(500).json({ message: 'Failed to generate AI form.', error: error.message });
  }
};

export const generateQuestionFromImage = async (req, res) => {
  const { imageBase64 } = req.body; 

  if (!imageBase64) {
    return res.status(400).json({ message: 'Image data is required.' });
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image. It contains one or multiple multiple-choice questions.
                     Extract ALL questions found.
                     
                     For each question, extract:
                     1. The question text.
                     2. The options.
                     3. The correct answer (ONLY if explicitly marked/highlighted, otherwise leave null).
                     
                     Return a SINGLE JSON object with this exact structure (no markdown):
                     {
                       "questions": [
                         {
                           "type": "MultipleChoice",
                           "text": "Question text here?",
                           "options": ["Option A", "Option B", "Option C", "Option D"],
                           "correctAnswer": "Option A" 
                         }
                       ]
                     }`
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64,
              },
            },
          ],
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct", 
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    const aiResponse = JSON.parse(content || "{}");
    const questions = aiResponse.questions || (aiResponse.type ? [aiResponse] : []);
    
    res.status(200).json({ questions });

  } catch (error) {
    console.error("Vision API Error:", error);
    res.status(500).json({ message: 'Failed to process image.', error: error.message });
  }
};