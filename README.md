# Authentication-using-Node.js
Backend for Authentication using Node.js

# Project Setup Guide

This guide will help you clone the repository and install all necessary dependencies to get the project running locally.

---

## 📥 Clone the Repository

First, open your terminal and run:
```bash
git clone https://github.com/kshitijarora04/Authentication-using-Node.js.git
cd Authentication-using-Node.js
npm install
```

Create a .env file in the root directory with the following content:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Replace your_mongodb_connection_string with your MongoDB URI (from MongoDB Atlas or local setup) and your_jwt_secret with a long, secure string.
