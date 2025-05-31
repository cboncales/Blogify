# 📝 Blogify - Simple Blog Web App

A full-stack blogging platform where users can register, log in, and manage blog posts with comments.

## ✅ Features

- **Authentication**: User registration, login, logout with JWT
- **Blog Posts**: Create, read, update, delete posts (only authors can edit/delete their own)
- **Comments**: Comment on any post, edit/delete your own comments
- **Responsive UI**: Modern design with Tailwind CSS
- **Access Control**: Role-based permissions

## 🧱 Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Password Hashing**: bcrypt

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. **Clone and install dependencies**:

```bash
npm run install-deps
```

2. **Set up PostgreSQL database**:

   - Create a database named `blogify`
   - Update database credentials in `server/.env`

3. **Configure environment variables**:

   - Copy `server/.env.example` to `server/.env`
   - Update the values with your database credentials and JWT secret

4. **Initialize database**:

```bash
cd server
npm run db:init
```

5. **Start the application**:

```bash
npm run dev
```

The app will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
blogify/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context
│   │   ├── services/      # API calls
│   │   └── utils/         # Helper functions
│   └── package.json
├── server/                # Node.js backend
│   ├── config/           # Database config
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   └── package.json
└── README.md
```

## 🖥️ API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Posts

- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post (auth required)
- `PUT /api/posts/:id` - Update post (author only)
- `DELETE /api/posts/:id` - Delete post (author only)

### Comments

- `GET /api/posts/:postId/comments` - Get post comments
- `POST /api/posts/:postId/comments` - Add comment (auth required)
- `PUT /api/comments/:id` - Update comment (author only)
- `DELETE /api/comments/:id` - Delete comment (author only)

## 🎨 UI Pages

- **Home**: List of all posts with preview
- **Post Detail**: Full post with comments
- **Create/Edit Post**: Form for managing posts
- **Login/Register**: Authentication forms
- **Dashboard**: User's posts management

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes
- CORS enabled
- Input validation
- SQL injection protection

## 📦 Dependencies

### Frontend

- React, React Router, Axios
- Tailwind CSS for styling
- React Context for state management

### Backend

- Express.js, bcryptjs, jsonwebtoken
- pg (PostgreSQL client)
- cors, helmet (security)
- express-validator (validation)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
