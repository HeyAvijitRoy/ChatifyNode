# Modern Chat App

<div align="center">

<a href="https://nodejs.org/" target="_blank">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node-dot-js&logoColor=white" alt="Node.js" />
</a>
<a href="https://expressjs.com/" target="_blank">
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
</a>
<a href="https://socket.io/" target="_blank">
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
</a>
<a href="https://cloud.google.com/appengine" target="_blank">
  <img src="https://img.shields.io/badge/Google%20App%20Engine-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white" alt="Google App Engine" />
</a>
<a href="https://choosealicense.com/licenses/mit/" target="_blank">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge&logo=opensourceinitiative&logoColor=black" alt="MIT License" />
</a>
<a href="https://www.avijitroy.net/" target="_blank">
  <img src="https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Live Demo" />
</a>


<br/><br/>

<!--
Replace with your own screenshot URL (hosted on imgur or your domain):
<img src="https://i.imgur.com/YOUR_SCREENSHOT.png" alt="Modern Chat App Screenshot" width="80%" style="border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.08);"/>
-->

</div>

A real-time chat application built with **Node.js**, **Express**, and **Socket.IO**. Supports instant messaging, emoji reactions, read receipts, typing indicators, and more — all in a clean, modern interface that works great on both desktop and mobile.

---

## 🚀 Features

* **Real-time Messaging**: Powered by Socket.IO
* **Emoji Reactions**: React to any message
* **Read Receipts**: Know who read your messages
* **Live Presence**: Typing indicators, user join/leave, and online users
* **Smart Notifications**: Audio, dynamic favicon, and tab title alerts
* **Fully Responsive UI**: Looks perfect on desktop, tablet, or mobile

---

## 🛠️ Installation & Local Development

### Prerequisites

* Node.js (v20+ recommended)
* NPM (comes with Node.js)

**Setup:**

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd your-repo-name
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Run the application:**
    ```bash
    node app.js
    ```

5.  **Open your browser** and navigate to `http://localhost:8080`.

---

## ⚙️ Configuration

| Variable | Description | Default |
| -------- | ----------- | ------- |
| `PORT`   | Server port | 8080    |

   *(Use `app.js` to change the default port.)

---

## 🌐 Deployment

This app is **production-ready for Google Cloud App Engine** (see `app.yaml`), but you can deploy anywhere that supports Node.js.

**To deploy on Google Cloud:**

1.  **Authenticate with gcloud:**
    ```bash
    gcloud auth login
    gcloud config set project YOUR_PROJECT_ID
    ```

2.  **Deploy the app:**
    ```bash
    gcloud app deploy
    ```

The configuration is managed by the `app.yaml` file. You can also deploy this to any other service that supports Node.js.

---

## ✨ Credits

Developed by [Avijit Roy](https://www.linkedin.com/in/HeyAvijitRoy/) .

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE). See [`LICENSE`](./LICENSE) for details.

