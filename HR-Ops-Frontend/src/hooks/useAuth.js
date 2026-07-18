// src/hooks/useAuth.js
export const useAuth = () => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userString || !token) {
        return { role: null, isAuthenticated: false, userId: null, userName: null };
    }
    
    const user = JSON.parse(userString);
    
    return { 
        role: user.role, // 'admin' or 'employee'
        isAuthenticated: true,
        token: token,
        userId: user.employeeId || user.id, // Adjust based on your actual object
        userName: user.name
    };
};