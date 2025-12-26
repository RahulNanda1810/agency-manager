# Agency Manager - Project Management System

A full-stack project management application built with Angular and Node.js, designed for agencies to manage multiple organizations, clients, projects, and tasks.

## 🌐 Live Demo

- **Frontend**: [https://your-app.netlify.app](https://your-app.netlify.app)
- **Backend API**: [https://your-backend.onrender.com](https://your-backend.onrender.com)

### Test Credentials
```
Email: test@example.com
Password: Test123!
```

## 📋 Features

- **Multi-Organization Support**: Users can be members of multiple organizations
- **Client Management**: Create and manage clients within organizations
- **Project Management**: Organize work by clients and projects
- **Task Management**: 
  - Kanban board view
  - List view with filters
  - Sprint management
  - Task assignment and tracking
- **My Tasks**: Personal dashboard showing all assigned tasks across organizations
- **Comments & Attachments**: Collaborate on tasks with team members
- **User Authentication**: Secure JWT-based authentication
- **Role-Based Access**: Organization-level permissions

## 🛠️ Tech Stack

### Frontend
- Angular 17+
- TypeScript
- SCSS
- RxJS
- Angular Router
- Standalone Components

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Cloudinary (file uploads)
- Bcrypt (password hashing)

## 📦 Project Structure

```
agency-manager/
├── agency-manager-frontend/     # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/           # Authentication module
│   │   │   ├── core/           # Core services & guards
│   │   │   ├── organizations/  # Organization management
│   │   │   ├── clients/        # Client management
│   │   │   ├── projects/       # Project management
│   │   │   ├── tasks/          # Task management (Kanban, List)
│   │   │   ├── sprints/        # Sprint management
│   │   │   ├── my-tasks/       # Personal task dashboard
│   │   │   └── shared/         # Shared components
│   │   └── environments/       # Environment configurations
│   ├── netlify.toml           # Netlify deployment config
│   └── package.json
│
└── agency-manager-backend/      # Node.js API
    ├── src/
    │   ├── controllers/        # Request handlers
    │   ├── models/            # Mongoose models
    │   ├── routes/            # API routes
    │   ├── middleware/        # Auth & error middleware
    │   ├── config/            # Database & Cloudinary config
    │   └── utils/             # JWT utilities
    ├── .env.example           # Environment variables template
    ├── render.yaml            # Render deployment config
    └── package.json

```

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)

### Backend Setup

1. Navigate to backend directory:
```bash
cd agency-manager-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agency_db
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agency_db

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=30m

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NODE_ENV=development
```

5. Start development server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd agency-manager-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

Frontend will run on `http://localhost:4200`

## 🌍 Production Deployment

### 1. MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user with password
4. Whitelist IP addresses (0.0.0.0/0 for all IPs)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/agency_db`

### 2. Backend Deployment (Render)

1. Push code to GitHub repository

2. Go to [Render](https://render.com) and create account

3. Create new Web Service:
   - Connect your GitHub repository
   - Select `agency-manager-backend` folder
   - Build Command: `npm install`
   - Start Command: `npm start`

4. Add Environment Variables:
```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRES_IN=30m
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

5. Deploy! Your backend will be available at `https://your-app.onrender.com`

### 3. Frontend Deployment (Netlify)

1. Update `src/environments/environment.prod.ts` with your backend URL:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend.onrender.com'
};
```

2. Push changes to GitHub

3. Go to [Netlify](https://www.netlify.com) and create account

4. Create new site from Git:
   - Connect your GitHub repository
   - Base directory: `agency-manager-frontend`
   - Build command: `npm run build`
   - Publish directory: `dist/agency-manager-frontend/browser`

5. Deploy! Your frontend will be available at `https://your-app.netlify.app`

### Alternative Deployment Options

#### Backend
- **Railway**: Similar to Render, auto-deploy from GitHub
- **Fly.io**: Global deployment with free tier
- **Azure App Service**: Enterprise-grade hosting
- **Heroku**: Classic PaaS option

#### Frontend
- **Vercel**: Optimized for Angular/React apps
- **Firebase Hosting**: Google's hosting solution
- **GitHub Pages**: Free for public repositories

## 📚 API Documentation

### Base URL
- Local: `http://localhost:5000`
- Production: `https://your-backend.onrender.com`

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Organizations

#### Get User's Organizations
```http
GET /orgs
Authorization: Bearer {token}
```

#### Create Organization
```http
POST /orgs
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Agency"
}
```

### Clients

#### Get Clients in Organization
```http
GET /clients?orgId={orgId}
Authorization: Bearer {token}
```

#### Create Client
```http
POST /clients
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Client Name",
  "email": "client@example.com",
  "orgId": "organization_id"
}
```

### Projects

#### Get Projects for Client
```http
GET /projects?clientId={clientId}
Authorization: Bearer {token}
```

#### Create Project
```http
POST /projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Project Name",
  "clientId": "client_id"
}
```

### Tasks

#### Get Tasks for Project
```http
GET /tasks?projectId={projectId}
Authorization: Bearer {token}
```

#### Create Task
```http
POST /tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Task Title",
  "projectId": "project_id",
  "status": "todo",
  "assigneeId": "user_id"
}
```

#### Update Task
```http
PUT /tasks/{taskId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in-progress",
  "assigneeId": "user_id"
}
```

#### Get My Tasks
```http
GET /tasks/my-tasks
Authorization: Bearer {token}
```

### Sprints

#### Get Sprints for Project
```http
GET /api/projects/{projectId}/sprints
Authorization: Bearer {token}
```

#### Create Sprint
```http
POST /api/projects/{projectId}/sprints
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Sprint 1",
  "startDate": "2025-01-01",
  "endDate": "2025-01-14"
}
```

## 🔒 Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

## ⚙️ Environment Variables

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | Yes |
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | Secret key for JWT tokens | Yes |
| JWT_EXPIRES_IN | Token expiration time | Yes |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | Yes |
| CLOUDINARY_API_KEY | Cloudinary API key | Yes |
| CLOUDINARY_API_SECRET | Cloudinary API secret | Yes |
| NODE_ENV | Environment (development/production) | Yes |

### Frontend
Update `environment.prod.ts` with your production backend URL.

## 🐛 Known Limitations

1. **File Upload Size**: Currently limited to 10MB per file
2. **Concurrent Editing**: No real-time collaboration yet
3. **Mobile Responsiveness**: Optimized for desktop, mobile UI needs improvement
4. **Task Dependencies**: No support for task dependencies yet
5. **Notifications**: Email notifications not implemented
6. **Search**: Global search across all entities not available
7. **Reports**: Advanced reporting and analytics not implemented
8. **Time Tracking**: No built-in time tracking functionality

## 🔜 Future Enhancements

- Real-time updates using WebSockets
- Email notifications for task assignments
- Advanced filtering and search
- Calendar view for tasks
- Time tracking and timesheets
- Gantt chart view
- Custom fields for tasks
- Webhooks for integrations
- Mobile app
- Dark mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

Rahul Nanda
- GitHub: [@rahulnanda](https://github.com/rahulnanda)

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- MongoDB for the database
- Render & Netlify for hosting
- Cloudinary for file storage

---

For questions or support, please open an issue on GitHub.
