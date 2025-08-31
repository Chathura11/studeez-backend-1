import User from "../models/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import axios from 'axios'
import nodemailer from 'nodemailer';
import OTP from "../models/otp.js";

const transport = nodemailer.createTransport({
    service:"gmail",
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
        user:"studeez.lanka@gmail.com",
        pass:"zajfcswaogskgqpn"
    }
})

// 🔹 Generate JWT Token
const generateToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  };
  
  // =======================
  // REGISTER NEW USER
  // =======================
  export const registerUser = async (req, res) => {
    try {
      const { name, email, password, role, grade,contactNo } = req.body;
  
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: "User already exists" });
  
      const user = await User.create({
        name,
        email,
        password,
        role: role || "student",
        grade,
        contactNo
      });
  
      const token = generateToken(user._id, user.role);
  
      res.status(201).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          grade: user.grade,
          contactNo:user.contactNo
        },
        token,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // =======================
  // LOGIN USER
  // =======================
  export const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email }).select("+password");
      if (!user) return res.status(404).json({ message: "User not found" });
  
      if (user.isBlocked)
        return res.status(403).json({ message: "User is blocked" });
  
      const isMatch = await user.comparePassword(password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid email or password" });
  
      const token = generateToken(user._id, user.role);
  
      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          grade: user.grade,
          emailVerified:user.emailVerified,
          contactNo:user.contactNo
        },
        token,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // =======================
  // GET ALL USERS (ADMIN ONLY)
  // =======================
  export const getAllUsers = async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // =======================
  // GET USER PROFILE
  // =======================
  export const getUserProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // =======================
  // BLOCK / UNBLOCK USER (ADMIN ONLY)
  // =======================
  export const toggleBlockUser = async (req, res) => {
    try {
      const user = await User.findOne({email:req.params.id});
      if (!user) return res.status(404).json({ message: "User not found" });
  
      user.isBlocked = !user.isBlocked;
      await user.save();
  
      res.status(200).json({
        message: `User has been ${user.isBlocked ? "blocked" : "unblocked"}`,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
      console.log(error);
    }
  };

export async function LoginWithGoogle(req,res){
    const accessToken = req.body.accessToken;

    try {
        const response =await axios.get('https://www.googleapis.com/oauth2/v3/userinfo',{
            headers:{
                Authorization:`Bearer ${accessToken}`
            }
        })
        const user = await User.findOne({email:response.data.email})

        if(user !=null){
            const token = jwt.sign({
                firstname : user.firstname,
                lastname : user.lastname,
                email:user.email,
                role:user.role,
                profilePicture:user.profilePicture,
                phone:user.phone,
                emailVerified:true
            },process.env.JWT_SECRET_KEY)

            res.status(200).json({message:"login successful!",token:token,user:user})
        }else{
            const newUser = new User({
                email: response.data.email,
                password : "123",
                firstname:response.data.given_name,
                lastname:response.data.family_name,
                address:"Not Given",
                phone:"Not Given",
                profilePicture:response.data.picture,
                emailVerified:true

            })

            const savedUser =await newUser.save();

            const token = jwt.sign({
                firstname : savedUser.firstname,
                lastname : savedUser.lastname,
                email:savedUser.email,
                role:savedUser.role,
                profilePicture:savedUser.profilePicture,
                phone:savedUser.phone
            },process.env.JWT_SECRET_KEY)

            res.status(200).json({message:"login successful!",token:token,user:savedUser})
        }

    } catch (error) {
        res.status(500).json({message:"Failed to login with google"});
    }
}


export async function SendOTP(req,res){

    const otp = Math.floor(Math.random()*9000)+1000;

    const newOPT = new OTP({
        email:req.user.email,
        otp:otp
    })

    await newOPT.save();
    

    const message={
        from :"chathuraasela11@gmail.com",
        to :req.user.email,
        subject :"Validating OTP",
        text : "Your otp code is " + otp
    }

    transport.sendMail(message,(err,info)=>{

        if(err){
            res.status(500).json({message:"Failed to send OTP!"})
        }else{
            res.status(200).json({message:"OTP sent successfully!"})
        }
    })
}

export async function VerifyOTP(req,res){

    const code = req.body.code

    const otp = await OTP.findOne({
        email : req.user.email,
        otp : code
    })

    if(otp == null){
        res.status(404).json({message:"Invaid OTP"});
    }else{
        await OTP.deleteOne({
            email : req.user.email,
            otp : code
        })

        await User.updateOne({email:req.user.email},{emailVerified:true})

        res.status(200).json({message:"Email verified successfully!"});
    }
}

export async function ForgotPassword(req, res) {
    const email = req.params.email;
    const tempPassword = Math.random().toString(36).slice(-10);

    const message = {
        from: "chathuraasela11@gmail.com",
        to: email,
        subject: "Forgot Password",
        text: "Your temporary password is " + tempPassword,
    };

    const user = await User.findOne({email:email})

    if(user == null){
        return res.status(404).json({message:'User not found!'});
    }

    transport.sendMail(message, async (err, info) => {
        if (err) {
            res.status(500).json({ message: "Failed to send temporary password!" });
        } else {
            const password = bcrypt.hashSync(tempPassword, 10);
            try {
                await User.updateOne({ email: email }, { password: password });
                res.status(200).json({ message: "Temporary password sent successfully!" });
            } catch (updateErr) {
                res.status(500).json({ message: "Email sent, but failed to update password!" });
            }
        }
    });
}

export async function ChangeUserPassword(req,res){
    const email = req.params.email;
    const data = req.body;

    const user = await User.findOne({email:email}).select("+password")

    console.log(user);

    if(user == null){
        return res.status(404).json({message:"User not found!"});
    }else{
        
        const isPasswordCorrect = bcrypt.compareSync(data.password,user.password);

        if(isPasswordCorrect){
            
            const password = bcrypt.hashSync(data.newPassword,10)
            try{
                await User.updateOne({email:email},{password : password});
                res.status(200).json({ message: "Password changed successfully!" });
            }catch(error){
                res.status(500).json({ message: "Failed to change password!" });
            }
        }else{
            return res.status(401).json({message:"Invalid password!"});
        }
    }
}

export const getTeachers = async (req, res) => {
    try {
      const teachers = await User.find({ role: "teacher" }).select("-password");
      res.status(200).json(teachers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching teachers", error: error.message });
    }
  };

  export const addTeacher = async (req, res) => {
    try {
      const { name, email, password,profilePicture ,contactNo,qualification} = req.body;
  
      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
  
      // Create new teacher
      const teacher = await User.create({
        name,
        email,
        password,
        role: "teacher",
        profilePicture,
        contactNo,
        qualification
      });
  
      // Return the created teacher without password
      const { password: pwd, ...teacherData } = teacher._doc;
      res.status(201).json(teacherData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to create teacher" });
    }
  };

export async function ForgotPasswordSendOTP(req,res){

    const email = req.params.email;

    try {
        const user =await User.findOne({email:email});
        if(user == null){
            return res.status(404).json({message:"User not found!"});
        }
    } catch (error) {
        return res.status(500).json({message:"Failed to load user!"});
    }

    const otp = Math.floor(Math.random()*9000)+1000;

    const newOPT = new OTP({
        email:email,
        otp:otp
    })

    await newOPT.save();
    

    const message={
        from :"chathuraasela11@gmail.com",
        to :email,
        subject :"Validating OTP",
        text : "Your otp code is " + otp
    }

    transport.sendMail(message,(err,info)=>{

        if(err){
            res.status(500).json({message:"Failed to send OTP!"})
        }else{
            res.status(200).json({message:"OTP sent successfully!"})
        }
    })
}

export async function ForgotPasswordVerifyOTP(req,res){
    
    const email = req.params.email

    try {
        const user =await User.findOne({email:email});
        if(user == null){
            return res.status(404).json({message:"User not found!"});
        }
    } catch (error) {
        return res.status(500).json({message:"Failed to load user!"});
    }

    const code = req.body.code

    const otp = await OTP.findOne({
        email : email,
        otp : code
    })

    if(otp == null){
        res.status(404).json({message:"Invaid OTP"});
    }else{
        await OTP.deleteOne({
            email : email,
            otp : code
        })

        await User.updateOne({email:email},{emailVerified:true})

        res.status(200).json({message:"Email verified successfully!"});
    }
}


export async function UpdateUser(req,res){

  const email = req.params.id;

  if(req.user == null){
      return res.status(403).json({message:"Unauthorized!"});
  }

  const data = req.body;

  try {
      const user = await User.findOne({email:email}).select("+password")

      if(user ==null){
          res.status(404).json({message:"User not found"})
      }else{
          if(user.isBlocked){
              res.status(403).json({message:"Your account is blocked.Please contact the admin!"})
              return;
          }

          let newData={
              password : user.password,
              name: data.name,
              grade : data.grade,
              profilePicture : data.profilePicture,           
          }

          if (data.password && data.newPassword) {
              const isPasswordCorrect = bcrypt.compareSync(data.password, user.password);
              if (isPasswordCorrect) {
                  newData.password = bcrypt.hashSync(data.newPassword, 10);
              } else {
                  return res.status(404).json({message:"Invalid password!"});
              }
          }       
       
          await User.updateOne({email:email},newData);

          res.status(200).json({message:"User updated successfully!"});

      }

  } catch (error) {
      res.status(500).json({message:"Failed to update user!"})
  }
}