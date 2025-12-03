// client/src/templates.js

const templateData = {
  // --- 1. PLACEMENT DRIVE REGISTRATION (Aligned with Image) ---
  'placement_registration': {
    name: 'Placement Drive Registration',
    description: 'Official student registration form for campus recruitment.',
    icon: '💼',
    data: {
      title: 'Placement Opportunity: [Company Name]',
      questions: [
        // --- Company Details Heading ---
        { 
          type: "Heading", 
          text: "📄 Company Details & Role" 
        },
        { 
          type: "Paragraph", 
          text: "Role: {Add role}\nBatch: 2026\nBranch: B.Tech (All Branches)\nCTC: __ LPA\n\nPlease ensure all details are accurate before submitting." 
        },
        
        // --- Personal Details ---
        { type: "Email", text: "Email" },
        { type: "ShortAnswer", text: "Full Name" },
        { type: "ShortAnswer", text: "Enrollment Number" },
        { 
          type: "Dropdown", 
          text: "Branch", 
          options: ["CSE-1", "CSE-2", "CSE-3", "IT", "ECE", "EE", "Mechanical", "Civil"],
          correctAnswer: null 
        },
        { 
          type: "MultipleChoice", 
          text: "Gender", 
          options: ["Male", "Female"],
          correctAnswer: null 
        },
        { type: "ShortAnswer", text: "Date of Birth (DD/MM/YYYY)" },
        { type: "ShortAnswer", text: "Mobile Number" },

        // --- Academic Marks ---
        { type: "Heading", text: "Academic Qualifications" },
        { type: "ShortAnswer", text: "10th Percentage %" },
        { type: "ShortAnswer", text: "12th Percentage %" },
        { type: "ShortAnswer", text: "Graduation Aggregate %" },
        { 
          type: "MultipleChoice", 
          text: "Current Backlogs", 
          options: ["0", "1", "2", "More than 2"],
          correctAnswer: "0" 
        },
        { 
          type: "MultipleChoice", 
          text: "Year of Passing", 
          options: ["2025", "2026", "2027"],
          correctAnswer: "2026" 
        },
        
        // --- Status & Declaration ---
        { type: "Heading", text: "Status & Declaration" },
        { 
          type: "MultipleChoice", 
          text: "Current Placement Status", 
          options: ["Unplaced", "Placed (Below 5 LPA)", "Placed (Above 5 LPA)"],
          correctAnswer: "Unplaced" 
        },
        { 
          type: "ShortAnswer", 
          text: "Declaration (Type 'Yes' to confirm you are applying)" 
        }
      ]
    }
  },

  // ... (Rest of the templates: tech_interview, brand_identity, etc. remain unchanged) ...
  'tech_interview': {
    name: 'Full Stack Interview',
    description: 'A deep technical assessment using code passages and logic puzzles.',
    icon: '💻',
    data: {
      title: 'Senior Developer Assessment v4.0',
      questions: [
        { type: "Heading", text: "Part 1: Code Analysis" },
        {
          type: "Comprehension",
          text: "Analyze the following React useEffect hook and answer the questions.",
          comprehensionPassage: "useEffect(() => { const subscription = props.source.subscribe(); return () => { subscription.unsubscribe(); }; }, [props.source]);",
          mcqs: [
            {
              questionText: "What is the purpose of the return function in this hook?",
              options: ["To render the component", "To clean up the subscription", "To memoize the value", "To trigger a re-render"],
              correctAnswer: "To clean up the subscription"
            },
            {
              questionText: "When will this effect re-run?",
              options: ["On every render", "Only on mount", "When props.source changes", "Never"],
              correctAnswer: "When props.source changes"
            }
          ]
        },
        { type: "Heading", text: "Part 2: System Architecture" },
        {
          type: "Categorize",
          text: "Drag the technologies into their correct architectural layer.",
          categories: ["Frontend", "Backend", "DevOps"],
          items: [
            { text: "React.js", category: "Frontend" },
            { text: "Docker", category: "DevOps" },
            { text: "Express", category: "Backend" },
            { text: "Tailwind CSS", category: "Frontend" },
            { text: "Kubernetes", category: "DevOps" },
            { text: "MongoDB", category: "Backend" }
          ]
        },
        { type: "Heading", text: "Part 3: Syntax & Logic" },
        {
          type: "Cloze",
          text: "Complete the JavaScript Promise syntax.",
          passage: "const fetchData = [BLANK] () => { try { const response = [BLANK] fetch('/api/data'); const data = await response.json(); return data; } catch (error) { console.error(error); } };",
          options: ["async", "await", "sync", "yield"]
        }
      ]
    }
  },
  'brand_identity': {
    name: 'Brand Identity Workshop',
    description: 'A visual strategy session for clients defining their brand voice.',
    icon: '🎨',
    data: {
      title: 'Brand Vision & Strategy',
      questions: [
        { type: "Heading", text: "Visual Direction" },
        { type: "Paragraph", text: "We need to establish the 'mood' of your new brand. Don't overthink it—go with your gut." },
        {
          type: "PictureChoice",
          text: "Which imagery style best represents your brand's aspiration?",
          options: [
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80"
          ],
          correctAnswer: null
        },
        { type: "Heading", text: "Brand Archetypes" },
        {
          type: "Categorize",
          text: "Sort these adjectives into how you WANT to be seen vs. how you are NOT.",
          categories: ["We Are", "We Are NOT"],
          items: [
            { text: "Playful", category: "We Are" },
            { text: "Serious", category: "We Are NOT" },
            { text: "Exclusive", category: "We Are NOT" },
            { text: "Accessible", category: "We Are" },
            { text: "Innovative", category: "We Are" }
          ]
        },
        { type: "Heading", text: "The Mission Statement" },
        {
          type: "Cloze",
          text: "Drag the words to complete your brand's core mission statement.",
          passage: "Our mission is to [BLANK] the way people communicate by building [BLANK] tools that foster [BLANK] connection.",
          options: ["revolutionize", "intuitive", "genuine", "maintain", "complex", "fake"]
        }
      ]
    }
  },
  'health_audit': {
    name: 'Patient Health History',
    description: 'A comprehensive medical intake form with history categorization.',
    icon: '🏥',
    data: {
      title: 'Comprehensive Health Audit',
      questions: [
        { type: "Heading", text: "Patient Demographics" },
        { type: "ShortAnswer", text: "Full Legal Name" },
        { type: "ShortAnswer", text: "Date of Birth (MM/DD/YYYY)" },
        {
          type: "Dropdown",
          text: "Blood Type",
          options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "Unknown"],
          correctAnswer: null
        },
        { type: "Heading", text: "Medical History" },
        {
          type: "Categorize",
          text: "Please categorize the conditions based on your family history.",
          categories: ["Self", "Immediate Family", "No History"],
          items: [
            { text: "Diabetes (Type 2)", category: "Immediate Family" },
            { text: "Hypertension", category: "Self" },
            { text: "Asthma", category: "No History" },
            { text: "Migraines", category: "Self" },
            { text: "Heart Disease", category: "Immediate Family" }
          ]
        },
        { type: "Heading", text: "Lifestyle & Habits" },
        {
          type: "MultipleChoice",
          text: "How often do you exercise?",
          options: ["Sedentary", "1-2 times/week", "3-5 times/week", "Daily"],
          correctAnswer: "3-5 times/week"
        },
        { type: "Switch", text: "Do you currently smoke or use tobacco products?" },
        { type: "LongAnswer", text: "Please list any current medications and dosages." }
      ]
    }
  },
  'product_roadmap': {
    name: 'Product Feature Roadmap',
    description: 'Prioritize upcoming features using a drag-and-drop matrix.',
    icon: '🚀',
    data: {
      title: 'Q4 Product Strategy & Prioritization',
      questions: [
        { type: "Heading", text: "Feature Prioritization Matrix" },
        { type: "Paragraph", text: "Help us decide what to build next. Drag features into the appropriate bucket based on your perception of value vs. effort." },
        {
          type: "Categorize",
          text: "Sort the proposed features into the correct priority quadrant.",
          categories: ["Quick Wins", "Major Projects", "Fill-ins", "Time Sinks"],
          items: [
            { text: "Social Login Integration", category: "Quick Wins" },
            { text: "Advanced Analytics Dashboard", category: "Major Projects" },
            { text: "Minor UI Polish", category: "Fill-ins" },
            { text: "Legacy Code Refactor", category: "Time Sinks" },
            { text: "Dark Mode", category: "Quick Wins" }
          ]
        },
        { type: "Heading", text: "Strategic Alignment" },
        {
          type: "MultipleChoice",
          text: "Which company goal is most important to you right now?",
          options: ["User Acquisition", "User Retention", "Revenue Growth", "Market Expansion"],
          correctAnswer: null
        },
        { type: "LongAnswer", text: "What is the one problem you wish our product solved for you today?" }
      ]
    }
  },
  'general_trivia': {
    name: 'General Knowledge Quiz',
    description: 'A fun mix of history, science, and pop culture questions.',
    icon: '🌍',
    data: {
      title: 'The Ultimate Pub Quiz',
      questions: [
        { type: "Heading", text: "Round 1: History & Geography" },
        {
          type: "Cloze",
          text: "Complete the historical facts.",
          passage: "The Great Wall of China was primarily built during the [BLANK] dynasty. The first human to journey into outer space was [BLANK].",
          options: ["Ming", "Han", "Yuri Gagarin", "Neil Armstrong"]
        },
        {
          type: "MultipleChoice",
          text: "Which is the largest ocean on Earth?",
          options: ["Atlantic", "Indian", "Arctic", "Pacific"],
          correctAnswer: "Pacific"
        },
        { type: "Heading", text: "Round 2: Science & Nature" },
        {
          type: "Categorize",
          text: "Sort the elements by their state at room temperature.",
          categories: ["Solid", "Liquid", "Gas"],
          items: [
            { text: "Iron (Fe)", category: "Solid" },
            { text: "Mercury (Hg)", category: "Liquid" },
            { text: "Oxygen (O)", category: "Gas" },
            { text: "Gold (Au)", category: "Solid" },
            { text: "Helium (He)", category: "Gas" }
          ]
        },
        { type: "Heading", text: "Round 3: Pop Culture" },
        {
          type: "PictureChoice",
          text: "Which movie won the Best Picture Oscar in 2020?",
          options: [
            "https://upload.wikimedia.org/wikipedia/en/3/3f/Parasite_%282019_film%29.png", 
            "https://upload.wikimedia.org/wikipedia/en/2/2e/1917_%282019_film%29_poster.jpg",
            "https://upload.wikimedia.org/wikipedia/en/8/8b/Once_upon_a_Time_in_Hollywood_poster.png",
            "https://upload.wikimedia.org/wikipedia/en/a/a3/Joker_%282019_film%29_poster.jpg"
          ],
          correctAnswer: "https://upload.wikimedia.org/wikipedia/en/3/3f/Parasite_%282019_film%29.png"
        }
      ]
    }
  }
};

export const templates = templateData;
export const templatesArray = Object.entries(templateData).map(([id, data]) => ({
  id,
  ...data
}));