# StructaQuiz MERN Application

Welcome to StructaQuiz! This is a full-stack MERN (MongoDB, Express, React, Node.js) application designed for creating, sharing, and taking interactive quizzes with unique and engaging question formats.

## 🚀 Features

StructaQuiz goes beyond simple multiple-choice questions to provide a more dynamic assessment experience.

### User & Form Management

*   **User Authentication**: Secure sign-up and sign-in functionality powered by Clerk.
    
*   **Dashboard**: A central hub for users to view, manage, create, and delete their forms.
    
*   **Form Editor**: A dedicated interface to build and customize quizzes, including adding titles and header images.
    
*   **Sharing**: Easily share quizzes with a unique, shareable link.
    

### Unique Question Types

*   **Comprehension**: Create questions based on a reading passage with multiple-choice answers.
    
*   **Categorize**: A drag-and-drop interface where users sort items into predefined categories.
    
*   **Cloze (Fill-in-the-Blanks)**: Users complete a passage by dragging the correct words into the blanks.
    

### Responses & Analytics

*   **Form Renderer**: A clean, responsive interface for users to take quizzes.
    
*   **Automated Scoring**: Submissions are automatically graded upon completion.
    
*   **Results Viewer**: Users can view their scores and a detailed breakdown of their answers.
    
*   **Response Management**: Creators can see all submissions for each of their forms.
    
*   **User Stats & Leaderboard**: Track your performance as a quiz creator and see how you rank against others.
    

## 🛠️ Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Axios
    
*   **Backend**: Node.js, Express.js
    
*   **Database**: MongoDB with Mongoose
    
*   **Authentication**: Clerk
    
*   **Image Hosting**: ImageKit
    

## ⚙️ Local Installation and Setup

To run this project locally, you will need to have **Node.js** and a local or cloud-based **MongoDB** instance.

### 1\. Clone the Repository

    git clone https://github.com/your-username/structaquiz-project.git
    cd structaquiz-project
    

### 2\. Backend Setup

Navigate to the server directory and install the necessary dependencies.

    cd server
    npm install
    

Create a `.env` file in the `/server` directory and add the following environment variables. You will need to get your own keys from MongoDB Atlas and ImageKit.

    # MongoDB Connection String
    MONGO_URI=your_mongodb_connection_string
    
    # Server Port
    PORT=5000
    
    # ImageKit Credentials
    IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
    IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
    IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
    
    # Frontend URL (for CORS)
    FRONTEND_URL=http://localhost:5173
    

To start the backend server, run:

    npm run dev
    

The server will be running on `http://localhost:5000`.

### 3\. Frontend Setup

In a new terminal, navigate to the client directory and install its dependencies.

    cd client
    npm install
    

Create a `.env` file in the `/client` directory and add the following variables. You will need your own keys from Clerk and ImageKit.

    # The base URL for your backend server
    VITE_API_BASE_URL=http://localhost:5000
    
    # Clerk Publishable Key
    VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    
    # ImageKit Public Key (for client-side uploads)
    VITE_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
    

To start the frontend development server, run:

    npm run dev
    

The application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).