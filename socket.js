import { io } from 'socket.io-client';

const SERVER_URL = 'http://192.168.29.63:3000'; // Change this to your IP if on real device

let socket;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ['websocket'],
    });
  }
  return socket;
};

export const getSocket = () => socket;
