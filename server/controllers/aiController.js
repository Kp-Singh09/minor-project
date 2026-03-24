// server/controllers/aiController.js
import Groq from 'groq-sdk';
import Form from '../models/Form.js';
import Question from '../models/Question.js';
import fs from 'fs'; 
import { createRequire } from 'module';

// Safely load the package
const require = createRequire(import.meta.url);
const pdfParseRaw = require('pdf-parse');

// --- SHARED SYSTEM PROMPT WITH DYNAMIC CONFIGURATION ---
// STRICTLY UNTOUCHED AS REQUESTED
const getSystemPrompt = (numQuestions = 5, validTypesArray = []) => {
  // Fallback to default types if empty
  const allowedTypes = validTypesArray.length > 0 
    ? validTypesArray.join('", "') 
    : 'MultipleChoice", "Comprehension", "Checkbox", "Dropdown", "Cloze", "Categorize';

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
            "comprehensionPassage": "Short passage text derived from the source...",
            "mcqs": [
              { "questionText": "Sub-question 1?", "options": ["Option 1", "Option 2"], "correctAnswer": "Option 1" }
            ]
          }
        },
        {
          "type": "Checkbox",
          "content": {
            "question": "Which of the following are correct?",
            "options": ["Correct A", "Wrong B", "Correct C"],
            "correctAnswers": ["Correct A", "Correct C"]
          }
        },
        {
          "type": "Dropdown",
          "content": {
            "question": "Select the correct word to complete the sentence.",
            "options": ["Word 1", "Word 2", "Word 3"],
            "correctAnswer": "Word 2"
          }
        },
        {
            "type": "Categorize",
            "content": {
                "categories": ["Category A", "Category B"],
                "items": [
                    { "text": "Item 1", "category": "Category A" },
                    { "text": "Item 2", "category": "Category B" }
                ]
            }
        },
        {
            "type": "Cloze",
            "content": {
                "passage": "The capital of France is [BLANK].",
                "options": ["Paris"]
            }
        }
      ]
    }

    Rules:
    1. Output strictly valid JSON.
    2. Create EXACTLY ${numQuestions} high-quality questions based on the input context.
    3. Use ONLY these exact types: "${allowedTypes}". Do not use any types outside of this list.
    4. For "Comprehension", you MUST use the exact keys 'comprehensionPassage' and 'questionText'.
    5. For "Checkbox", you MUST provide an array of multiple correct options named 'correctAnswers'.
    6. For "Categorize", provide a 'categories' array and an 'items' array containing objects with 'text' and 'category'.
    7. For "Cloze", provide a 'passage' string containing '[BLANK]' where the missing words are, and an 'options' array with the answers in order.
  `;
};

// --- HELPER: SAVE TO DB ---
const saveGeneratedForm = async (aiData, userId, username, res) => {
    try {
        const title = aiData.title || aiData.form?.title || aiData.quiz?.title || 'AI Generated Assessment';
        const questionsArray = aiData.questions || aiData.form?.questions || aiData.quiz?.questions || [];

        if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
            return res.status(500).json({ message: 'AI failed to generate a valid question structure. Please try again.' });
        }

        const newForm = new Form({
            title: title,
            creatorId: userId,
            username: username || 'AI Architect',
            theme: 'Light',
            questions: []
        });
        
        const savedForm = await newForm.save();
        const questionIds = [];

        for (const qData of questionsArray) {
            let contentPayload = qData.content || {};
            
            if (!contentPayload.question && qData.text && qData.type !== 'Comprehension') contentPayload.question = qData.text;
            if (!contentPayload.options && qData.options) contentPayload.options = qData.options;
            if (!contentPayload.correctAnswer && qData.correctAnswer) contentPayload.correctAnswer = qData.correctAnswer;

            const newQuestion = new Question({
                formId: savedForm._id, 
                type: qData.type || 'ShortAnswer', 
                content: contentPayload
            });
            const savedQuestion = await newQuestion.save();
            questionIds.push(savedQuestion._id);
        }

        savedForm.questions = questionIds;
        await savedForm.save();

        if (!res.headersSent) {
            return res.status(201).json({ formId: savedForm._id });
        }
    } catch (error) {
        console.error("Database Save Error:", error);
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Failed to save generated form.', error: error.message });
        }
    }
};

// --- TEXT-TO-QUIZ (TOPIC PROMPT) ---
export const generateFormWithAI = async (req, res) => {
  // Now successfully extracts numQuestions and questionTypes from your UI
  const { prompt, userId, username, numQuestions, questionTypes } = req.body; 
  if (!prompt || !userId) return res.status(400).json({ message: 'Prompt/User required.' });
  
  try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
          messages: [
              // Passes the variables exactly like the PDF generator
              { role: "system", content: getSystemPrompt(numQuestions, questionTypes) },
              // Commands the AI to generate the passages/contexts based on the topic
              { role: "user", content: `Generate a highly accurate educational quiz strictly about the topic: "${prompt}". You must invent all necessary context, reading passages, and sentences for the requested question types based on your expert knowledge of this topic.` }
          ],
          model: "llama-3.1-8b-instant",
          response_format: { type: "json_object" }
      });

      const aiResponse = JSON.parse(completion.choices[0]?.message?.content || "{}");
      await saveGeneratedForm(aiResponse, userId, username, res);

  } catch (error) {
      console.error("AI Gen Error:", error);
      if (!res.headersSent) {
          res.status(500).json({ message: 'AI generation failed.', error: error.message });
      }
  }
};

// --- DOCUMENT-TO-QUIZ (RAG) ---
export const generateFormFromDocument = async (req, res) => {
  try {
    console.log("\n--- STARTING AI PDF PROCESSING ---");

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    let dataBuffer;
    if (req.file.buffer) {
        dataBuffer = req.file.buffer;
    } else if (req.file.path) {
        dataBuffer = fs.readFileSync(req.file.path);
    } else {
        throw new Error("Unable to locate file data.");
    }
    
    let rawText = "";

    try {
        const PDFParseClass = pdfParseRaw.PDFParse;
        const parser = new PDFParseClass({ data: dataBuffer });
        let extractedData = await parser.getText();

        if (typeof extractedData === 'string') {
            rawText = extractedData;
        } else if (extractedData && extractedData.text) {
            rawText = extractedData.text; 
        } else if (Array.isArray(extractedData)) {
            rawText = extractedData.join('\n'); 
        } else if (typeof extractedData === 'object') {
            rawText = JSON.stringify(extractedData); 
        } else {
            rawText = String(extractedData);
        }
    } catch (v2Error) {
        let pdfFunc = typeof pdfParseRaw === 'function' ? pdfParseRaw : pdfParseRaw.default;
        const data = await pdfFunc(dataBuffer);
        
        if (typeof data === 'string') {
            rawText = data;
        } else if (data && data.text) {
            rawText = data.text;
        } else {
            rawText = JSON.stringify(data);
        }
    }

    rawText = String(rawText || "");

    if (rawText.trim().length === 0 || rawText === "{}") {
        throw new Error("PDF parsed successfully, but no readable text could be identified inside.");
    }

    const textContent = rawText.replace(/\n+/g, " ").substring(0, 12000); 

    const { userId, username, numQuestions, questionTypes } = req.body;
    let parsedTypes = [];
    try {
        if (questionTypes) parsedTypes = JSON.parse(questionTypes);
    } catch (e) { console.error("Could not parse question types array"); }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: getSystemPrompt(numQuestions, parsedTypes) },
            { role: "user", content: `Generate a highly accurate, evaluable quiz based strictly on this document content: \n\n${textContent}` }
        ],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0]?.message?.content || "{}");
    
    await saveGeneratedForm(aiResponse, userId, username, res);
    console.log("Success! Form Generated.");

  } catch (error) {
    console.error("\n=========================================");
    console.error("🚨 DOC PARSING ERROR DETAILS 🚨");
    console.error("Message:", error.message);
    if (!res.headersSent) {
        res.status(500).json({ 
            message: 'Document analysis failed. Check server logs.', 
            error: error.message 
        });
    }
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
              text: `Analyze this image. Extract ALL multiple-choice questions found.
                     Return a SINGLE JSON object:
                     {
                       "questions": [
                         {
                           "type": "MultipleChoice",
                           "content": {
                             "question": "Question text?",
                             "options": ["A", "B", "C", "D"],
                             "correctAnswer": "A"
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
      model: "llama-3.2-11b-vision-preview", 
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    const aiResponse = JSON.parse(content || "{}");
    const questions = aiResponse.questions || (aiResponse.type ? [aiResponse] : []);
    
    res.status(200).json({ questions });

  } catch (error) {
    console.error("Vision API Error:", error);
    if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to process image.', error: error.message });
    }
  }
};