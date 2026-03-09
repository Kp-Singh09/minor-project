// server/controllers/aiController.js
import Groq from 'groq-sdk';
import Form from '../models/Form.js';
import Question from '../models/Question.js';
import pdf from 'pdf-parse/lib/pdf-parse.js'; // Ensure you have installed pdf-parse

// --- SHARED SYSTEM PROMPT ---
const getSystemPrompt = () => {
  return `
    You are an expert assessment architect.
    You must respond ONLY with a single JSON object (no markdown, no backticks).
    
    Structure:
    {
      "title": "A Creative Title",
      "questions": [
        {
          "type": "MultipleChoice",
          "content": {
            "question": "Question text?",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "A"
          }
        },
        {
          "type": "Comprehension",
          "content": {
            "comprehensionPassage": "Short passage text...",
            "mcqs": [
              { "questionText": "Sub-question 1?", "options": ["1", "2"], "correctAnswer": "1" }
            ]
          }
        },
        {
            "type": "Categorize",
            "content": {
                "categories": ["Cat A", "Cat B"],
                "items": [
                    { "text": "Item 1", "category": "Cat A" },
                    { "text": "Item 2", "category": "Cat B" }
                ]
            }
        },
        {
            "type": "Cloze",
            "content": {
                "sentence": "The capital of France is Paris.",
                "blanks": ["Paris"]
            }
        }
      ]
    }

    Rules:
    1. Output strictly valid JSON.
    2. Create 5-10 high-quality questions based on the input context.
    3. Use only these types: "MultipleChoice", "Comprehension", "Categorize", "Cloze".
    4. For "Comprehension", generate a relevant passage from the source text.
  `;
};

// --- HELPER: SAVE TO DB ---
const saveGeneratedForm = async (aiData, userId, username, res) => {
    try {
        const newForm = new Form({
            title: aiData.title || 'AI Generated Assessment',
            creatorId: userId,
            username: username || 'AI Architect',
            theme: 'Light',
            questions: []
        });
        
        const savedForm = await newForm.save();
        const questionIds = [];

        for (const qData of aiData.questions) {
            // Handle content mapping based on structure
            // If the AI returns "text" instead of "content.question", we normalize it here
            let contentPayload = qData.content || {};
            
            // Fallback normalization if AI drifts from strict structure
            if (!contentPayload.question && qData.text) contentPayload.question = qData.text;
            if (!contentPayload.options && qData.options) contentPayload.options = qData.options;
            if (!contentPayload.correctAnswer && qData.correctAnswer) contentPayload.correctAnswer = qData.correctAnswer;

            const newQuestion = new Question({
                formId: savedForm._id, 
                type: qData.type,
                content: contentPayload
            });
            const savedQuestion = await newQuestion.save();
            questionIds.push(savedQuestion._id);
        }

        savedForm.questions = questionIds;
        await savedForm.save();

        res.status(201).json({ formId: savedForm._id });
    } catch (error) {
        console.error("Database Save Error:", error);
        res.status(500).json({ message: 'Failed to save generated form.', error: error.message });
    }
};

// --- TEXT-TO-QUIZ ---
export const generateFormWithAI = async (req, res) => {
  const { prompt, userId, username } = req.body; 
  if (!prompt || !userId) return res.status(400).json({ message: 'Prompt/User required.' });
  
  try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
          messages: [
              { role: "system", content: getSystemPrompt() },
              { role: "user", content: `Generate a quiz about: ${prompt}` }
          ],
          model: "llama-3.1-8b-instant",
          response_format: { type: "json_object" }
      });

      const aiResponse = JSON.parse(completion.choices[0]?.message?.content || "{}");
      await saveGeneratedForm(aiResponse, userId, username, res);

  } catch (error) {
      console.error("AI Gen Error:", error);
      res.status(500).json({ message: 'AI generation failed.', error: error.message });
  }
};

// --- DOCUMENT-TO-QUIZ (RAG) ---
export const generateFormFromDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // 1. Extract Text from PDF
    const dataBuffer = req.file.buffer;
    const data = await pdf(dataBuffer);
    
    // Clean and limit text to fit context window (approx 15k chars for safety)
    const textContent = data.text.replace(/\n+/g, " ").substring(0, 15000); 

    // 2. Feed to AI
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: getSystemPrompt() },
            { role: "user", content: `Generate a quiz based strictly on this document content: \n\n${textContent}` }
        ],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0]?.message?.content || "{}");
    
    // 3. Save
    const { userId, username } = req.body;
    await saveGeneratedForm(aiResponse, userId, username, res);

  } catch (error) {
    console.error("Doc Parsing Error:", error);
    res.status(500).json({ message: 'Document analysis failed.', error: error.message });
  }
};

// --- VISION (IMAGE-TO-QUESTION) ---
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
                           "content": {
                             "question": "Question text?",
                             "options": ["Option A", "Option B", "Option C", "Option D"],
                             "correctAnswer": "Option A"
                           }
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
      model: "llama-3.2-11b-vision-preview", // Updated vision model identifier if needed, or stick to what works
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    const aiResponse = JSON.parse(content || "{}");
    const questions = aiResponse.questions || (aiResponse.type ? [aiResponse] : []);
    
    // Normalize structure for frontend if needed, or return as is
    res.status(200).json({ questions });

  } catch (error) {
    console.error("Vision API Error:", error);
    res.status(500).json({ message: 'Failed to process image.', error: error.message });
  }
};