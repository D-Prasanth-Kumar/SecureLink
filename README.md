# SecureLink 🛡️

SecureLink is a high-security, client-side encrypted vault designed for sharing temporary secrets with zero-knowledge architecture. It ensures that sensitive data—such as passwords, API keys, or private notes—is never stored in plain text on a server. Using the Web Crypto API, data is encrypted in the browser before being sent to the cloud.

## Features

- **Easy-Understandable Encryption**: Uses AES-256 GCM encryption. The decryption key remains in the URL fragment (#) and is never sent to the backend.
- **3-Strike Security Protocol**: Automatically destroys the secret from the database after 3 failed PIN attempts to prevent brute-force attacks.
- **Self-Destructing Links**: Configurable Time-To-Live (TTL). Secrets are automatically purged from MongoDB after expiration.
- **Manual Burn-on-Read**: Allows creators to manually "burn" (delete) the secret immediately after the intended recipient has read it.
- **Dynamic QR Code Generation**: Instant QR code creation for secure, contact-less mobile sharing.
- **Cloud Native Architecture**: Dockerized Java backend for consistent environments and scalable MongoDB Atlas storage.
- **Fully Responsive**: A modern, sleek UI built with React and Tailwind CSS, optimized for both desktop and mobile security.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide React (Icons), Axios
- **Backend**: Java, Spring Boot, Spring Data MongoDB
- **Encryption**: Web Crypto API (Browser-native AES-256)
- **Database**: MongoDB Atlas (Cloud)
- **Deployment**: Docker, Render (Backend), Vercel (Frontend)

## Live Demo

- **Frontend (Vercel)**: https://secure-link-vault.vercel.app
- **Backend API (Render)**: https://securelink-e88n.onrender.com

## Quick Start (Run Locally)

### Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- MongoDB (Local or Atlas)
- Maven

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/D-Prasanth-Kumar/SecureLink.git
   cd SecureLink
   ```

2. **Backend Setup (Spring Boot):**
   Configure your MongoDB URI in src/main/resources/application.properties:
   
   ```bash
   spring.data.mongodb.uri=mongodb+srv://admin:<password>@cluster.mongodb.net/SecureLinkDB
   server.port=8080
   ```

   Run the application:

   ```bash
   mvn spring-boot:run
   ```

3. **Frontend Setup:**
   Open a new terminal and navigate to the frontend folder:

   ```bash
   cd securelink-ui
   ```

   Install dependencies:

   ```bash
   npm install
   ```

   Set up environment variables: Create a .env file inside securelink-ui/ and add:

   ```bash
   VITE_API_URL=http://localhost:8080/api
   ```

   Start the development server:

   ```bash
   npm run dev
   ```

4. **Access the App:** Open your browser and visit http://localhost:5173 .

## Project Structure

```
SecureLink/
├── Dockerfile                  # Containerization for Render
├── pom.xml                     # Maven dependencies (Spring Data MongoDB)
├── src/
│   ├── main/java/com/securelink/backend/
│   │   ├── controller/         # REST Endpoints (Create, View, Burn)
│   │   ├── model/              # MongoDB Document Entity (Secret)
│   │   ├── repository/         # MongoRepository Interfaces
│   │   ├── config/             # CORS & Web Configuration
│   │   └── SecurelinkBackendApplication.java
│   └── main/resources/
│       └── application.properties
├── securelink-ui/              # React Frontend (Vite)
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── crypto.js           # AES-256 Logic (Web Crypto API)
│   │   ├── App.jsx             # Main Logic & API Handling
│   │   └── assets/             # Styles & Images
│   ├── public/                 # Favicons & Static Assets
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## API Endpoints

### Secret Management

POST /api/create - Store an encrypted secret and return a unique ID and Admin Token.

GET /api/check/{id} - Publicly check if a secret still exists and how many attempts are left.

POST /api/view/{id} - Verify PIN and retrieve the encrypted content (Decrements attempts on failure).

GET /api/status/{id} - Verify if a secret is still active for the creator's dashboard.

POST /api/burn/{id} - Immediately delete a secret using the Admin Token.

## Deployment Guide

### Backend (Render):

- Push code to GitHub.
- Create a new Web Service on Render.
- Set Runtime to Docker.
- **Add Environment Variable:** MONGO_DB_URI (Ensure special characters in password are URL encoded).
- Deploy.

### Frontend (Vercel):

- Import the repository into Vercel.
- Set Root Directory to securelink-ui.
- **Add Environment Variable:** VITE_API_URL = https://your-backend-url.onrender.com/api
- Deploy.

## Contributing

**Contributions are welcome! Help us make SecureLink even safer.**

- Fork the Project
- Create your Feature Branch (git checkout -b feature/Feature-context)
- Commit your Changes (git commit -m 'Add some Feature')
- Push to the Branch (git push origin feature/Feature-context)
- Open a Pull Request


   
   




















   
