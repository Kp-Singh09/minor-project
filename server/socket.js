// server/socket.js
import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173", 
        process.env.FRONTEND_URL,
        "https://formify-kp.vercel.app"
      ],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log(`Neural Link Established: ${socket.id}`);

    // --- FORM EDITOR COLLABORATION ---
    
    // User joins a specific form's workspace
    socket.on("join_form", ({ formId, user }) => {
      socket.join(formId);
      console.log(`User ${user.username} joined form ${formId}`);
      
      // Notify others in the room
      socket.to(formId).emit("user_joined", { user });
      
      // Send active users list (Simplified: just echoing back the new user for now)
      // In a real Redis setup, you'd fetch the full list of active socket IDs in this room
    });

    // Handle Form Updates (Debounced on client, broadcasted here)
    socket.on("update_form_title", ({ formId, title, userId }) => {
      // Broadcast to everyone EXCEPT sender
      socket.to(formId).emit("form_title_updated", { title, userId });
    });

    socket.on("update_question", ({ formId, question, userId }) => {
      socket.to(formId).emit("question_updated", { question, userId });
    });

    socket.on("delete_question", ({ formId, questionId, userId }) => {
      socket.to(formId).emit("question_deleted", { questionId, userId });
    });

    socket.on("add_question", ({ formId, question, userId }) => {
      socket.to(formId).emit("question_added", { question, userId });
    });

    // Cursor/Focus Presence
    socket.on("focus_field", ({ formId, fieldId, user }) => {
      socket.to(formId).emit("remote_focus", { fieldId, user });
    });

    // --- REAL-TIME ANALYTICS ---
    socket.on("new_submission", ({ formId }) => {
      // Notify the creator if they are watching the dashboard or the specific form stats
      // We broadcast to the formId room because the creator listens there
      io.to(formId).emit("submission_received");
    });

    socket.on("disconnect", () => {
      console.log("Neural Link Lost:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};