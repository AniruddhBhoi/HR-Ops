# CzarCore - Employee Management System

A modern, full-stack Employee Management System built with the MERN stack featuring role-based authentication, leave management, payroll processing, and analytics dashboard.

##  Features

### Admin Features
- **Employee Management**: Add, edit, delete, and view employee records
- **Leave Request Management**: Approve/reject employee leave requests
- **Holiday Calendar**: Create and manage company holidays
- **Payroll System**: Generate payslips with salary breakdown
- **Analytics Dashboard**: Employee statistics and department insights
- **Advanced Search & Filtering**: Filter by department, role, and search by name

### Employee Features
- **Personal Dashboard**: View profile and leave balance
- **Leave Request System**: Submit and track leave requests
- **Profile Management**: Update personal information and change password
- **Payroll Access**: View salary breakdown and download payslips
- **Holiday Calendar**: View company holidays

### Additional Features
- **Role-based Authentication**: Separate admin and employee access
- **Responsive Design**: Mobile and desktop optimized
- **Dark/Light Theme**: Toggle between themes
- **Toast Notifications**: Modern, non-intrusive notifications
- **Auto Sunday Holidays**: All Sundays marked as holidays
- **Password Security**: Secure password change functionality

##  Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Email Validation**: validator.js

##  Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Quick Start

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd EMS
```

### 2. Install Dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/CzarCore
JWT_SECRET=your_jwt_secret_key
PORT=5002
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 4. Start MongoDB
Make sure MongoDB is running on your system or verify your MongoDB Atlas connection.

### 5. Run Application
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
# Backend: npm start
# Frontend: cd client && npm run dev
```

## 🔧 Troubleshooting

### MongoDB Connection Issues
If you encounter MongoDB connection timeouts:

1. **Local MongoDB**: Ensure MongoDB service is running
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

2. **MongoDB Atlas**: Check your connection string in `.env`
   - Verify username/password
   - Ensure IP whitelist includes your current IP
   - Check network connectivity

3. **Connection String Format**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   ```

### Common Fixes
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check firewall settings
- Verify environment variables in `.env` file

### 6. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5002

## 👤 Default Admin Account

```
Email: admin@czarcore.com
Password: admin123
```

## Project Structure

```
EMS/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   └── App.js         # Main app component
│   └── package.json
├── server/
│   └── server.js          # Express server
├── package.json           # Root dependencies
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Admin Routes
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/leave-requests` - Get all leave requests
- `PUT /api/leave-requests/:id` - Update leave request status

### Employee Routes
- `GET /api/employee/profile` - Get employee profile
- `POST /api/employee/leave-requests` - Submit leave request
- `GET /api/employee/my-leave-requests` - Get own leave requests
- `PUT /api/employee/change-password` - Change password

### Holiday Routes
- `GET /api/holidays` - Get holidays
- `POST /api/holidays` - Create holiday
- `PUT /api/holidays/:id` - Update holiday
- `DELETE /api/holidays/:id` - Delete holiday

## Key Features Explained

### Role-Based Access Control
- **Admin**: Full system access including employee management
- **Employee**: Limited access to personal data and leave requests

### Automatic Employee Setup
- Auto-generated Employee ID and work email
- Password generated from date of birth (DDMMYYYY format)
- Default 20 annual leaves assigned

### Leave Management
- Multiple leave types (Casual, Sick, Annual, Emergency)
- Automatic leave balance calculation
- Admin approval workflow

### Payroll System
- Salary breakdown with PF (12%) and Tax (10%) deductions
- Professional payslip generation
- Downloadable and printable payslips

##  Security Features

- JWT token-based authentication
- Password hashing with bcrypt (12 rounds)
- Input validation and sanitization
- Role-based route protection
- Secure password change functionality

##  Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Adaptive layouts

##  Deployment

### Frontend (Netlify/Vercel)
1. Build the client: `cd client && npm run build`
2. Deploy the `build` folder

### Backend (Railway/Render/Heroku)
1. Set environment variables
2. Deploy the root directory

### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Update MONGODB_URI in environment variables

##  Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.





**Built with  using MERN Stack**