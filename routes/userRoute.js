import express from "express";
import { ChangeUserPassword, ForgotPassword, ForgotPasswordSendOTP,getTeachers,addTeacher, ForgotPasswordVerifyOTP, LoginWithGoogle, SendOTP, VerifyOTP, loginUser, registerUser,getAllUsers,getUserProfile,toggleBlockUser, UpdateUser } from "../controllers/userController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", protect, getUserProfile);

router.put("/edit/:id",protect, UpdateUser);

router.get("/", protect,getAllUsers);

router.put("/:id/block", protect, adminOnly, toggleBlockUser);

router.get("/teachers", protect, adminOnly, getTeachers);

router.post("/teacher", protect, adminOnly, addTeacher);

router.post('/google',LoginWithGoogle);

router.get('/sendOTP',protect,SendOTP);

router.post('/verifyEmail',protect,VerifyOTP);

router.get('/forgotPassword/sendOTP/:email',ForgotPasswordSendOTP);

router.post('/forgotPassword/verifyEmail/:email',ForgotPasswordVerifyOTP);

router.get('/forgotPassword/:email',ForgotPassword);

router.put('/changePassword/:email',ChangeUserPassword);


export default router;