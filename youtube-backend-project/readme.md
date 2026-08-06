# YouTube Backend Project

A friendly, easy-to-read backend for a YouTube-like application. This project provides the API and core server logic for users, videos, comments, likes, playlists, subscriptions, and basic media handling.

## What this is

- A small Node.js + Express backend that demonstrates common patterns used to build a video-sharing service: authentication, file uploads, relationships between users and videos, and simple analytics/endpoints.

## Features

- User registration, login and JWT-based auth
- Video upload (via Multer and Cloudinary)
- Commenting and liking system
- Playlists and subscriptions
- Simple dashboard and health check endpoints

## Tech stack

- Node.js (ES modules)
- Express 5
- MongoDB + Mongoose
- Cloudinary for media hosting
- Multer for multipart uploads
- dotenv for environment configuration

## Quick start

Prerequisites: Node.js (18+ recommended), npm, and a MongoDB instance (local or cloud).

1. Clone the repo and change into the project folder.

2. Install dependencies:

```
npm install
```

3. Create a `.env` file in the project root with the following environment variables (examples):

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/youtube
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

4. Run the development server:

```
npm run dev
```

The server entrypoint is `src/index.js` and the `dev` script uses `nodemon`.

## API overview

High-level endpoints are organized under `src/routes`. Examples:

- `POST /api/users/register` — register a new user
- `POST /api/users/login` — authenticate and receive a JWT
- `POST /api/videos` — upload a video (authenticated)
- `GET /api/videos` — list videos
- `POST /api/videos/:id/comments` — add a comment
- `POST /api/videos/:id/like` — like a video
- `GET /api/dashboard` — simple dashboard metrics

See the route files in `src/routes` and controllers in `src/controllers` for full details.

## Project structure

- `src/` — application source
	- `controllers/` — route handlers
	- `models/` — Mongoose models
	- `routes/` — route definitions
	- `middlewares/` — auth, file upload, etc.
	- `db/` — database connection
	- `utils/` — helpers and response/error wrappers

## Contributing

Contributions are welcome. Open an issue or send a PR with a focused change. Keep changes small and add tests where appropriate.

## License & author

This project is provided as-is. Author: Mudasir Iqbal.

---

If you want, I can also:

- Add example Postman collection or cURL examples
- Document each API route with request/response examples
- Add a `.env.example` file

Tell me which next step you prefer.