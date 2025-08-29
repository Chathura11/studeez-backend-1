import express from 'express'
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import userRouter from './routes/userRoute.js';
import authRouter from './routes/authRoute.js';
import subjectRouter from './routes/subjectRoute.js';
import classRouter from './routes/classRoute.js';
import dotenv from 'dotenv'
import cors from 'cors'
import teacherRoute from "./routes/teacherRoute.js";
import materialRoute from "./routes/materialRoute.js";
import announcementRoute from "./routes/announcementRoute.js";
import assignmentRoute from "./routes/assignmentRoute.js";
import attendanceRoute from "./routes/attendanceRoute.js";
import submissionRoute from "./routes/submissionRoute.js";
import studentRoute from './routes/studentRoute.js';
import classZoomlinkRoute from './routes/classZoomLinkRoute.js';



dotenv.config();

const app = express();

app.use(cors());

app.use(bodyParser.json());

const mongoURL = process.env.MONGO_URL;

mongoose.connect(mongoURL);

const connection = mongoose.connection;

connection.once("open",()=>{
    console.log("MongoDB connection established successfully!");
})

app.use('/api/user',userRouter);
app.use('/api/subject',subjectRouter);
app.use('/api/auth',authRouter);
app.use('/api/class',classRouter);
app.use("/api/teacher", teacherRoute);
app.use("/api/material", materialRoute);
app.use("/api/announcement", announcementRoute);
app.use("/api/assignment", assignmentRoute);
app.use("/api/attendance", attendanceRoute);
app.use("/api/submission", submissionRoute);
app.use("/api/student",studentRoute);
app.use("/api/zoomlink",classZoomlinkRoute);


app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})