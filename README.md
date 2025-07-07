# Modern Chat App

A real-time chat application built using **Node.js**, **Express**, and **Socket.IO**. This app supports live messaging, user reactions, read receipts, and dynamic user management. The frontend is styled with CSS and provides a modern, responsive chat interface.

---

## 🚀 Features

* Real-time chat messaging (via Socket.IO)
* Emoji reactions to messages
* Read receipts
* Typing indicators
* User join/leave notifications
* Audio notifications (optional toggle)
* Tab title and favicon notifications for new messages
* Modern and responsive UI (optimized for desktop & mobile)

---

## 📂 Project Structure

```
chat-app/
├── app.js                # Main server script
├── package.json          # Dependencies and scripts
├── app.yaml              # Google Cloud App Engine config (optional)
├── public/               # Public static files
│   ├── index.html        # Login and main chat interface
│   ├── chat.html         # (Alternate chat UI, legacy)
│   ├── client.js         # Frontend logic with Socket.IO
│   ├── style.css         # Styling for the app
│   ├── favicon.png       # Default favicon
│   ├── favicon-alert.png # Alert favicon (new messages)
│   └── notification.mp3  # Audio notification sound
```

---

## 🔧 Installation & Running Locally

### Prerequisites:

* Node.js (v14+ recommended)

### Setup:

1. Clone the repository or copy the folder.

2. Navigate to the project directory:

   ```bash
   cd D:\Coding\chat-app\chat
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run the application:

   ```bash
   node app.js
   ```

   Or, if you add a `start` script to `package.json`, you can run:

   ```bash
   npm start
   ```

5. Open your browser at:

   ```
   http://localhost:8080
   ```

---

## ⚙️ Environment Variables

* `PORT`: Optional. Set a custom port. Defaults to **8080**.

---

## 🌐 Deployment

This app was originally deployed on **Google Cloud App Engine Standard Environment**.

You can deploy it elsewhere by simply running it on a Node.js server. Static files are served from the `/public` directory.

---

## ✨ Credits

Developed by **Avijit Roy**.

---

## 📜 License

ISC License. See `package.json` for details.
