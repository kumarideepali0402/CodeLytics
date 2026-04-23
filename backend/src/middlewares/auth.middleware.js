import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const authDynamic = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      emailId: decoded.emailId,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};



export const authCollege = (req, res, next) => {
  if (req.user?.role !== "COLLEGE") {
    return res.status(403).json({ message: "Access denied: College only" });
  }
  next();
};


export const authStudent = (req, res, next) => {
  if (req.user?.role !== "STUDENT") {
    return res.status(403).json({ message: "Access denied: Student only" });
  }
  next();
};



export const authTeacher = (req, res, next) => {
  if (req.user?.role !== "TEACHER") {
    return res.status(403).json({ message: "Access denied: Teacher only" });
  }
  next();
};

export const authTeacherOrCollege = (req, res, next) =>{
  if(req.user?.role != "TEACHER" &&  req.user?.role != "COLLEGE") {
    return res.status(403)({message : "Access denied: Teacher and college only"});
  }
  next();
}

