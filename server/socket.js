// server/socket.js
import { Server } from 'socket.io';

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Neural Link Established:', socket.id);

    socket.on('join-room', (formId) => {
      socket.join(formId);
      console.log(`User joined workspace: ${formId}`);
    });

    socket.on('editor-change', (data) => {
      // Broadcast changes to everyone else in the room
      socket.to(data.formId).emit('receive-changes', data.questions);
    });

    socket.on('cursor-move', (data) => {
      socket.to(data.formId).emit('receive-cursor', {
        userId: socket.id,
        userName: data.userName,
        x: data.x,
        y: data.y
      });
    });

    socket.on('disconnect', () => {
      console.log('Neural Link Terminated');
    });
  });

  return io;
};