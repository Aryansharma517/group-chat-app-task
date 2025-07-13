# 📱 ChatApp - React Native + Node.js (Socket.IO)

A real-time group chat app using **React Native** (without Expo) and **Socket.IO backend**.

---

## 🚀 Features

- Join with custom username
- Real-time group chat
- Typing and sending messages
- Message history sync
- Mobile-responsive UI

---

## 📦 Project Structure

```
chatapp/
├── App.js                 # Main React Native app
├── socket.js              # Frontend socket client
├── server/                # Node.js backend server
│   └── index.js
└── README.md
```

---

## 🧰 Prerequisites

- Node.js (v18+ recommended)
- Android Studio / Xcode (with emulators or physical device)
- React Native CLI
- Real device & PC must be on same Wi-Fi for testing

---

## ⚙️ React Native Setup

1. **Install dependencies**

```bash
npm install
```

2. **Run Metro server**

```bash
npx react-native start
```

3. **Run on Android**

```bash
npx react-native run-android
```

Or iOS:

```bash
npx react-native run-ios
```

---

## 🌐 Backend (Node.js + Socket.IO)

1. **Go to server folder**

```bash
cd server
```

2. **Install dependencies**

```bash
npm install express socket.io cors
```

3. **Start the server**

```bash
node index.js
```

---

## 📡 Real Device Setup

To test on a real device:

1. Find your local IP address:

```bash
ipconfig (Windows)
ifconfig (Mac/Linux)
```

E.g., `192.168.1.10`

2. In `socket.js` (frontend), use:

```js
import { io } from 'socket.io-client';

export const initializeSocket = () =>
  io('http://192.168.1.10:3000'); // replace with your local IP
```

3. Ensure your phone and PC are on same Wi-Fi network.
