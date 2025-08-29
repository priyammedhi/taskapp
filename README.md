Task Manager App (React Native + Flask)

A simple Task Manager mobile app built with React Native (Expo) for the frontend and Flask (Python) for the backend. Users can login, view tasks, add new tasks, update their status, and delete tasks. This project demonstrates a full-stack setup with API integration and responsive UI.

Features

User Authentication: Login using email & password (dummy credentials for demo).

Task Management:

View a list of tasks

Add new tasks

Toggle task status (pending/done)

Delete tasks

Theme Support: Light & Dark mode using useColorScheme.

Interactive UI: Tasks displayed in styled cards with proper margins, shadows, and spacing.

Cross-platform: Runs on iOS & Android via Expo Go.

Tech Stack

Frontend:

React Native with Expo

Axios for API requests

AsyncStorage for storing login sessions

Styled components and cards for UI

Backend:

Python Flask

Flask-CORS

Simple REST API for tasks and login

Installation & Setup
Backend
cd task-backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
pip install flask flask-cors
python app.py

Frontend
cd task-app
npm install
# Start app in browser or scan QR code with Expo Go
npx expo start


⚠️ Make sure API_BASE in constants.ts points to your backend server.
