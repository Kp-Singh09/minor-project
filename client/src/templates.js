// client/src/templates.js

// Define the data for your templates here.
// The 'questions' array must match the structure your database expects.
const templateData = {
  // --- EXISTING TEMPLATES ---
  'basic_quiz': {
    name: 'Basic Quiz',
    description: 'A 3-question quiz with various types.',
    icon: '📚',
    data: {
      title: 'Basic Quiz',
      questions: [
        {
          "type": "MultipleChoice",
          "text": "What is the capital of France?",
          "options": ["London", "Berlin", "Paris", "Madrid"],
          "correctAnswer": "Paris"
        },
        {
          "type": "ShortAnswer",
          "text": "What is 2 + 2?"
        },
        {
            "type": "Checkbox",
            "text": "Which of the following are fruits?",
            "options": ["Apple", "Carrot", "Banana", "Broccoli"],
            "correctAnswers": ["Apple", "Banana"]
        }
      ]
    }
  },
  'contact_form': {
    name: 'Contact Form',
    description: 'A simple contact information form.',
    icon: '✉️',
    data: {
      title: 'Contact Us',
      questions: [
        {
          "type": "ShortAnswer",
          "text": "Your Name"
        },
        {
          "type": "Email",
          "text": "Your Email"
        },
        {
            "type": "Paragraph",
            "text": "Your Message"
        }
      ]
    }
  },
  'tech_quiz': {
    name: 'Tech Quiz',
    description: 'A short quiz about technology.',
    icon: '💻',
    data: {
        title: 'Tech Quiz',
        questions: [
            {
                "type": "Categorize",
                "categories": ["Frontend", "Backend"],
                "items": [
                    { "text": "React", "category": "Frontend" },
                    { "text": "Node.js", "category": "Backend" },
                    { "text": "CSS", "category": "Frontend" },
                    { "text": "Express", "category": "Backend" }
                ]
            },
            {
                "type": "Cloze",
                "passage": "React is a [BLANK] library, while Express is a [BLANK] framework.",
                "options": ["JavaScript", "Node.js"]
            }
        ]
    }
  },

  // --- NEW TEMPLATES ---

  'student_feedback': {
    name: 'Student Feedback',
    description: 'A survey for collecting course feedback.',
    icon: '🎓',
    data: {
      title: 'Course Feedback Form',
      questions: [
        {
          "type": "Heading",
          "text": "Course Feedback"
        },
        {
            "type": "Paragraph",
            "text": "Please provide your anonymous feedback to help us improve this course."
        },
        {
            "type": "Dropdown",
            "text": "Which course are you providing feedback for?",
            "options": ["History 101", "Math 202", "Science 303", "Art 404"],
            "correctAnswer": "History 101" // A default is needed, but it's not "scored"
        },
        {
          "type": "MultipleChoice",
          "text": "How would you rate the overall quality of this course?",
          "options": ["Very Poor", "Poor", "Average", "Good", "Excellent"],
          "correctAnswer": "Excellent" // Default, not scored
        },
        {
            "type": "Paragraph",
            "text": "What did you like most about the course?"
        },
        {
            "type": "Paragraph",
            "text": "What suggestions do you have for improvement?"
        }
      ]
    }
  },

  'job_application': {
    name: 'Job Application',
    description: 'A standard form for job applicants.',
    icon: '💼',
    data: {
      title: 'Job Application',
      questions: [
        {
          "type": "Heading",
          "text": "Apply for the Role"
        },
        {
          "type": "ShortAnswer",
          "text": "Full Name"
        },
        {
          "type": "Email",
          "text": "Email Address"
        },
        {
          "type": "ShortAnswer",
          "text": "Phone Number"
        },
        {
            "type": "ShortAnswer",
            "text": "Link to your Portfolio/LinkedIn"
        },
        {
            "type": "Paragraph",
            "text": "Why are you a good fit for this role?"
        }
      ]
    }
  },
  
  'event_rsvp': {
    name: 'Event RSVP',
    description: 'A quick RSVP form for an event.',
    icon: '🎉',
    data: {
      title: 'You\'re Invited!',
      questions: [
        {
          "type": "ShortAnswer",
          "text": "Full Name"
        },
        {
          "type": "Email",
          "text": "Email Address"
        },
        {
          "type": "Switch",
          "text": "Will you be attending?"
        },
        {
          "type": "Dropdown",
          "text": "What is your meal preference?",
          "options": ["Chicken", "Fish", "Vegetarian", "Vegan"],
          "correctAnswer": "Chicken" // Default
        }
      ]
    }
  },

  'capitals_quiz': {
    name: 'World Capitals Quiz',
    description: 'A complex quiz on world geography.',
    icon: '🌍',
    preview: 'bg-orange-500', 
    previewText: 'text-white', 
    data: {
      title: 'World Capitals Quiz',
      questions: [
        {
            "type": "Comprehension",
            "comprehensionPassage": "Tokyo, the capital of Japan, is the world's most populous metropolis. It is known for its blend of modern and traditional culture, from skyscrapers to historic temples. The city will host the Olympics.",
            "mcqs": [
                {
                    "questionText": "What is the world's most populous metropolis?",
                    "options": ["New York", "Tokyo", "London"],
                    "correctAnswer": "Tokyo"
                },
                {
                    "questionText": "What event is mentioned being hosted in the city?",
                    "options": ["World Cup", "Olympics", "World Expo"],
                    "correctAnswer": "Olympics"
                }
            ]
        },
        {
            "type": "Categorize",
            "categories": ["Europe", "Asia"],
            "items": [
                { "text": "Paris", "category": "Europe" },
                { "text": "Beijing", "category": "Asia" },
                { "text": "Rome", "category": "Europe" },
                { "text": "Bangkok", "category": "Asia" }
            ]
        }
        
      ]
    }
  }
// ... (keep any other templates you have) ...
};

// Export both the object for lookup and an array for mapping
export const templates = templateData;
export const templatesArray = Object.entries(templateData).map(([id, data]) => ({
  id,
  ...data
}));