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
          "type": "ShortAnswer",
          "text": "Your short answer question?"
          // Note: ShortAnswer does not have options or a correct answer
        },
        {
          "type": "Comprehension",
          "comprehensionPassage": "A short passage (2-4 sentences) for the user to read.",
          "mcqs": [
            {
              "questionText": "A question about the passage?",
              "options": ["Option 1", "Option 2", "Option 3"],
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
        },
        {
          "type": "Cloze",
          "passage": "This is a passage with a [BLANK] and another [BLANK].",
          "options": ["blank_word_1", "blank_word_2"]
        }
      ]
    }

    Rules:
    - Respond with a single, minified JSON object.
    - Do NOT use markdown (like \`\`\`json).
    - ONLY use the question types: "MultipleChoice", "ShortAnswer", "Comprehension", "Categorize", "Cloze".
    - Do not use other types like "Heading", "Paragraph", "Banner", "Email", "Checkbox", "Dropdown", "Switch", or "PictureChoice".
    - Create between 3 and 7 questions.
    - Ensure 'correctAnswer' for MultipleChoice exactly matches one of the strings in 'options'.
    - For 'Cloze', the number of strings in 'options' must exactly match the number of [BLANK] tags in the 'passage'.
  `;
};

export const generateFormWithAI = async (req, res) => {
    const { prompt, userId, username } = req.body;

    if (!prompt || !userId) {
        return res.status(400).json({ message: 'Prompt and User ID are required.' });
    }

    try {
        // Initialize Groq inside the function to ensure .env is loaded
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });

        const fullPrompt = getSystemPrompt();
        
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: fullPrompt
                },
                {
                    role: "user",
                    content: `User prompt: "${prompt}"`
                }
            ],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" } // Request JSON directly
        });

        const text = chatCompletion.choices[0]?.message?.content || "";

        // Parse the JSON string from Groq
        const aiResponse = JSON.parse(text);

        // --- Create the Form in the Database ---

        // 1. Create the Form document
        const newForm = new Form({
            title: aiResponse.title,
            userId: userId,
            username: username || 'AI User',
            // --- THIS IS THE FIX ---
            theme: 'Light', // Changed from 'Default' to 'Light'
            // --- END OF FIX ---
            questions: [],
        });

        // 2. Create and save all Question documents
        const questionIds = [];
        for (const qData of aiResponse.questions) {
            const questionPayload = {
                type: qData.type,
                text: qData.text,
                options: qData.options,
                correctAnswer: qData.correctAnswer,
                categories: qData.categories,
                items: qData.items,
                passage: qData.passage,
                comprehensionPassage: qData.comprehensionPassage,
                mcqs: qData.mcqs,
            };
            
            const newQuestion = new Question(questionPayload);
            await newQuestion.save();
            questionIds.push(newQuestion._id);
        }

        // 3. Add question IDs to the form and save the form
        newForm.questions = questionIds;
        await newForm.save();

        // 4. Send the new form's ID back to the client
        res.status(201).json({ formId: newForm._id });

    } catch (error) {
        console.error("AI generation or database creation failed:", error);
        res.status(500).json({ message: 'Failed to generate AI form.', error: error.message });
    }
};