# Wall of Fame – WEB2 Backend ✨

This repository contains the backend API for the Wall of Fame project, a full-stack web application where users can register, log in and showcase personal achievements (“wins”). The backend handles authentication, data persistence and secure CRUD operations.

The API is consumed by a Vue 3 + Vite frontend hosted on Netlify.

---

## Tech stack

Node.js  
Express.js  
MongoDB Atlas  
JSON Web Tokens (JWT)  
Hosting: Render  

---

## Live API

Backend API (Render):  
https://wall-of-fame-api.onrender.com

---

## Features

User registration and login  
JWT-based authentication  
Secure CRUD operations for wins  
Ownership protection (users can only edit or delete their own wins)  
RESTful API architecture  
MongoDB Atlas cloud database  

---

## Up & running (local development)

1. Clone the repository  
   git clone https://github.com/Alexanderdeloecker/web2-course-project-back-end-Alexanderdeloecker-1.git

2. Install dependencies  
   npm install

3. Create a `.env` file with the following variables:  
   PORT=3000  
   MONGO_URI=your_mongodb_atlas_connection_string  
   JWT_SECRET=your_secret_key  

4. Start the server  
   npm run dev

5. The API will be available on  
   http://localhost:3000

---

## Sources

The following sources were consulted during the development of this backend:

Express.js – Official Documentation  
https://expressjs.com/

Node.js – Official Documentation  
https://nodejs.org/en/docs

MongoDB Atlas – Official Documentation  
https://www.mongodb.com/docs/atlas/

JWT – Official Introduction  
https://jwt.io/introduction

W3Schools – Node.js Tutorial  
https://www.w3schools.com/nodejs/

W3Schools – Express.js Tutorial  
https://www.w3schools.com/nodejs/nodejs_express.asp

MDN Web Docs – HTTP & REST Concepts  
https://developer.mozilla.org/en-US/docs/Web/HTTP

Any external concepts inspired by these sources were adapted and implemented in my own code structure.

---

