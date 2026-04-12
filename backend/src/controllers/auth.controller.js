import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const COLLEGE = "COLLEGE";
const STUDENT = "STUDENT";
const TEACHER = "TEACHER";

export const handleLogin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ msg: "Email, Password, and Role are required." });
    }

    if (!JWT_SECRET) {
      return res.status(500).json({ msg: "JWT_SECRET is not defined in environment variables." });
    }

    const roleUpperCase = role.toUpperCase();
    let user;

    switch (roleUpperCase) {
      case COLLEGE:
        user = await prisma.college.findUnique({
          where: { email },
        });
        break;

      case STUDENT:
      case TEACHER:
        user = await prisma.user.findUnique({
          where: { email },
        });
        break;

      default:
        return res.status(400).json({ msg: "Invalid role provided." });
    }

    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Invalid password." });
    }

    const reply = {
      id: user.id,
      email: user.email,
      role: roleUpperCase,
      name: user.name || "No Name Provided",
    };

    const accessToken = jwt.sign(
      { id : user.id, emailId: email, role : roleUpperCase},
      JWT_SECRET,
      { expiresIn : '15m'}
    );

    const refreshToken = jwt.sign(
      { id: user.id,  emailId: email, role : roleUpperCase},
      REFRESH_SECRET,
      { expiresIn : '7d'}
    )

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    })
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7*24*60*60*1000,
      sameSite: 'strict'
    });
    
    return res.status(200).json({
      user: reply,
      msg: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};





export const handleLogout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ msg: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ msg: "Error in logging out" });
  }
};


export const checkUser = async (req, res) => {
  try {
    const { id, emailId, role } = req.user || {};

    if (!id && !emailId && !role) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    return res.status(200).json({
      msg: "User is authenticated",
      user: { id, emailId, role },
    });
  } catch (error) {
    console.error("CheckUser Error:", error);
    return res.status(500).json({ msg: "Error authenticating user" });
  }
};


export const handleRefreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ msg: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role, emailId: decoded.emailId },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken =jwt.sign(
      {id: decoded.id, role: decoded.role, emailId: decoded.emailId},
      REFRESH_SECRET,
      { expiresIn : '7d'}
    )

    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly : true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge : 7*24*60*60*1000


    })

    return res.status(200).json({ msg: "Access token refreshed" });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(403).json({ msg: "Invalid or expired refresh token" });
  }
}







