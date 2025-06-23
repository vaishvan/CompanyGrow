# CompanyGrow

A full-stack web application for managing employees, projects, and courses with role-based access control.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- Git

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/vaishvan/CompanyGrow
cd CompanyGrow
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://0.0.0.0/companygrow
JWT_SECRET=your_secure_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_API_SECRET=your_stripe_api_secret
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Database Setup

From the backend directory, seed the database with initial data:

```bash
node seed.js
```

### 5. Running the Application

Start the backend server (from backend directory):

```bash
npm start
```

Start the frontend development server (from frontend directory):

```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Default Login Credentials

After seeding the database, you can log in with:

- Admin: username `admin`, password `admin123`
- Manager: username `manager`, password `manager123`
- Employee: username `employee`, password `employee123`

## Features

- User authentication and authorization
- Role-based access control (Admin, Manager, Employee)
- Employee management
- Project management
- Course management and enrollment
- Employee performance reports
- PDF report generation
- Token management for real-time rewards

## Technology Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT
- File Upload: Cloudinary
- Token Management: Stripe
