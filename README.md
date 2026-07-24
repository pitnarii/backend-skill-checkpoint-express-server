# Express Q&A platform API Server

## Project Description
This project is a simple Express.js API server for managing questions and answers. It uses PostgreSQL as the database and provides endpoints for creating, reading, updating, deleting questions, and creating/retrieving answers.

## How to Install and Run the Project
1. Open the project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make sure PostgreSQL is running and the database named `quora` is available.
4. Update the database connection string in `server/utils/db.mjs` if needed.
5. Start the server:
   ```bash
   cd server
   npm start
   ```
6. The server will run at:
   ```bash
   http://localhost:4000
   ```

You can test the API using Postman or any HTTP client.