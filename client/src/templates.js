// client/src/templates.js

// Define the data for your templates here.
// The 'questions' array must match the structure your database expects.
const templateData = {
  // --- EXISTING TEMPLATES ---
  
  'contact_form': {
    name: 'Contact Form',
    description: 'A simple contact information form.',
    icon: '✉️',
    preview: 'bg-gray-600',
    previewText: 'text-white',
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
            "type": "LongAnswer", // <-- FIX: Was "Paragraph"
            "text": "Your Message"
        }
      ]
    }
  },

  'student_feedback': {
    name: 'Student Feedback',
    description: 'A survey for collecting course feedback.',
    icon: '🎓',
    preview: 'bg-green-600',
    previewText: 'text-white',
    data: {
      title: 'Course Feedback Form',
      questions: [
        // ... (keep Heading, Paragraph, Dropdown, MultipleChoice)
        {
          "type": "MultipleChoice",
          "text": "How would you rate the overall quality of this course?",
          "options": ["Very Poor", "Poor", "Average", "Good", "Excellent"],
          "correctAnswer": "Excellent"
        },
        {
            "type": "LongAnswer", // <-- FIX: Was "Paragraph"
            "text": "What did you like most about the course?"
        },
        {
            "type": "LongAnswer", // <-- FIX: Was "Paragraph"
            "text": "What suggestions do you have for improvement?"
        }
      ]
    }
  },

  'job_application': {
    name: 'Job Application',
    description: 'A standard form for job applicants.',
    icon: '💼',
    preview: 'bg-gray-800',
    previewText: 'text-white',
    data: {
      title: 'Job Application',
      questions: [
        // ... (keep Heading, ShortAnswer, Email, ShortAnswer)
        {
            "type": "ShortAnswer",
            "text": "Link to your Portfolio/LinkedIn"
        },
        {
            "type": "LongAnswer", // <-- FIX: Was "Paragraph"
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


};

// Export both the object for lookup and an array for mapping
export const templates = templateData;
export const templatesArray = Object.entries(templateData).map(([id, data]) => ({
  id,
  ...data
}));