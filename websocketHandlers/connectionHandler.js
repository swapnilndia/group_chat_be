export default function connectionHandler(socket, io) {
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined the room`);
  });
  // Leave a room
  socket.on("leave", (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left the room ${roomId}`);
  });
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
}
