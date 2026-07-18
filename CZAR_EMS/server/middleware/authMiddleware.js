// const jwt = require('jsonwebtoken');
// const User = require('../model/userModel');
// const Admin = require('../model/adminModel')


// const verifyToken = (req, res, next) => {
//   const token = req.header('Authorization')?.replace('Bearer ', '');
//   if (!token) return res.status(401).json({ message: 'No token provided' });

//   try {
//     req.user = jwt.verify(token, process.env.JWT_SECRET || 'czarcore_secret_key');
//     next();
//   } catch {
//     res.status(401).json({ message: 'Invalid or expired token' });
//   }
// };

// // const verifyAdmin = async (req, res, next) => {
// //   console.log(req.user.userId);

// //   const user = await Admin.findById(req.user.userId);
// //   // console.log(user.role === 'admin');
// //   console.log("user : ", user);

// //   if ( user.role === 'admin') 
// //   {
// //     next();
// //     return
// //   }
// // //  return res.status(403).json({ message: 'Admin access required' });
// // };
//        const verifyAdmin = async (req, res, next) => {
//          try {
//            console.log(req.user.id);

//            const user = await Admin.findOne(req.user.id);
//            console.log("user : ", user);

//            if (!user || user.role !== 'admin') {
//              return res.status(403).json({ message: 'Admin access required' });
//            }

//            next();
//          } catch (error) {
//            console.error('Admin verification error:', error);
//            return res.status(500).json({ message: 'Internal server error' });
//          }
//        };



// module.exports = { verifyToken, verifyAdmin };

const jwt = require('jsonwebtoken');
const Admin = require('../model/adminModel');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    req.user = jwt.verify(token, 'czarcore_secret_key');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    console.log("verifyAdmin - req.user:", req.user);

    // Role check
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access denied" });
    }

    // Find admin by userId field (this is the correct field to search by)
    let admin = await Admin.findOne({ userId: req.user.userId });

    if (!admin) {
      console.log("verifyAdmin - Admin not found, creating missing admin document");
      const User = require('../model/userModel');
      const dbUser = await User.findById(req.user.userId);
      if (dbUser && dbUser.role === 'admin') {
        admin = await new Admin({
          userId: req.user.userId,
          name: dbUser.name,
          email: dbUser.email,
          password: dbUser.password, // Copy password hash
          role: 'admin',
          isActive: true,
        }).save();
        console.log("verifyAdmin - Created missing admin document");
      }
    }

    if (!admin) {
      console.log("verifyAdmin - Admin not found in DB");
      return res.status(403).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("verifyAdmin error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { verifyToken, verifyAdmin };
