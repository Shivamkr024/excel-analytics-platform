Excel Analytics Platform (minimal)
---------------------------------
This archive contains a minimal MERN-style project:
- backend: Node/Express server that accepts Excel uploads, parses to JSON and stores in MongoDB.
- frontend: React app (minimal) to upload files and run simple analytics grouped by column.

Quick start (backend):
  cd backend
  npm install
  mkdir uploads
  # optionally set MONGO_URI in .env
  npm run dev

Quick start (frontend):
  cd frontend
  npm install
  npm start

Notes:
  - Backend default Mongo: mongodb://localhost:27017/excel_analytics
  - Uploads saved to backend/uploads
  - For production, use proper storage (S3/GridFS), auth, and validations.
