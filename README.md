# HR Operation System (EMS)

A full-stack Employee Management System (EMS) designed to streamline HR operations, employee tracking, attendance, and leave management.

## 🚀 Technologies Used

### Backend (`HR-Ops_Backend`)
- **Node.js & Express.js**: REST API framework
- **MongoDB & Mongoose**: Database and ODM
- **JWT & Passport**: Authentication and authorization
- **Multer**: File and document uploads
- **XLSX**: Excel file processing

### Frontend (`HR-Ops_Frontend`)
- **React 19 & Vite**: Fast, modern frontend framework
- **Tailwind CSS**: Utility-first styling
- **React Router DOM**: Client-side routing
- **Axios**: API requests
- **Lucide React & React Icons**: Iconography
- **React Hot Toast**: Notifications and alerts

### Infrastructure
- **Docker & Docker Compose**: Containerization for easy setup and deployment
- **Nginx**: Web server (configured in frontend container)

---

## 📂 Project Structure

- `/HR-Ops_Backend` - Backend Node.js API server
- `/HR-Ops_Frontend` - Frontend React application
- `docker-compose.yml` - Configuration for running the entire stack via Docker

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (running locally or a MongoDB Atlas URI)
- Docker & Docker Compose (Optional, for containerized setup)

### Running with Docker (Recommended)

1. Ensure Docker is running on your machine.
2. Configure your environment variables in `HR-Ops_Backend/.env`.
3. Build and start the containers:
   ```bash
   docker-compose up --build
   ```
4. The frontend will be available at `http://localhost:80` and the backend at `http://localhost:5002`.

### Running Locally (Without Docker)

#### 1. Setup Backend
```bash
cd HR-Ops_Backend
npm install

# Make sure your .env file is configured, then start the server:
npm run dev
# or
npm start
```
The backend API will run on `http://localhost:5002` (or the port specified in `.env`).

#### 2. Setup Frontend
```bash
cd HR-Ops_Frontend
npm install

# Start the Vite development server
npm run dev
```
The frontend application will be available at `http://localhost:5173`.

---

## ⚙️ Environment Variables

Create a `.env` file in the `HR-Ops_Backend` directory with the following variables:

```env
PORT=5002
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
# Add other necessary variables like email configurations, etc.
```

---

## 📝 Features
- **Authentication**: Secure login with JWT.
- **Employee Directory**: Manage employee profiles and details.
- **Attendance Tracking**: Clock-in, clock-out, and attendance history.
- **Leave Management**: Request, approve, or reject time-off.
- **Document Management**: Securely upload and manage employee documents.
- **Notifications**: Automated email and system notifications.
- **Salary Slips**: View and download monthly payslips.
