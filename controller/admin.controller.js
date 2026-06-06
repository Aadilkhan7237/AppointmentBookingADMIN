import { adminModel } from "../models/admin.model.js";
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



export const settingInfo=async(req,res)=>{

    try {

        // const {adminID}=req.admin;
        
        const admin=await adminModel.findOne({});
          
        const infoObj={
            fullName:admin.fullName,
            email:admin.email,
            phoneNumber:admin.phoneNumber
        }

        res.status(200).json({message:infoObj});

    } catch (error) {
        console.log(error);
         res.status(500).json({message:"Cant fetch info"});
    }
}


export const register=async(req,res)=>{
         
    try {

        const {fullName,email,phone,pass}=req.body;

        const salt=Number(process.env.SALT_ROUNDS);

        const hashedPass=await bcrypt.hash(pass,salt);

        
        const admin=new adminModel({
            fullName:fullName,
            email:email,
            phoneNumber:phone,
            password:hashedPass,
        });

        await admin.save();

        res.status(200).json({message:"Register Admin Successfully"});
        
    } catch (error) {
         res.status(500).json({message:"Error while registering"});
    }
}


export const login=async(req,res)=>{
    
      
     try {
         const { email, pass } = req.body;
        //   console.log(email,"       ",pass);

        // return res.status(200).json({message:"Working"});

       const admin = await adminModel.findOne({ email:email });
   
      
   
       if (!admin) {
         res
           .status(500)
           .json({ message: "Email or password is incorrect" });
         return;
       }

       const ispasswordMatched = await bcrypt.compare(pass, admin.password);
   
       if (ispasswordMatched) {
         const token = jwt.sign({ adminId: admin._id }, process.env.SECRET, {
           algorithm: "HS512",
           expiresIn: "1h",
         });

         //console.log(token);
         const isProduction = process.env.NODE_ENV === "production";
         res.cookie("jwtADMIN", token, {
           httpOnly: true,
           secure: isProduction,
           sameSite: isProduction ? "none" : "lax",
           path: "/",
         });
         res
           .status(200)
           .json({ message: "Admin logged in successfully" });
       } else {
         res
           .status(500)
           .json({ message: "Email or password is incorrect" });
       }
     } catch (e) {
       res.status(500).json({ message: `${e}` });
     }
}


export const logout = async (req, res) => {
  const token = req.cookies.jwtADMIN;
   console.log(token);
  try {
    if (!token) {
      return res
        .status(404)
        .json({ message: "Please LogIn First" });
    }

    if (token) {
      const isProduction = process.env.NODE_ENV === "production";
      res.clearCookie("jwtADMIN", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
      });

      res.status(200).json({ message: "Admin logged out successfully" });
      return;
    }
  } catch (e) {
    res
      .status(500)
      .json({ message: "Internal server error occured" });
  }
};



export const profileChange=async(req,res)=>{
         
    try {

        const {fullName,email,phone}=req.body;

      const admin =await adminModel.findOne({email:email});

      if(admin.fullName===fullName&&admin.email===email&&admin.phoneNumber===phone){
        return res.status(201).json({message:"No changes found"});
      }

      admin.fullName=fullName;
      admin.email=email;
      admin.phoneNumber=phone;

      await admin.save();

        res.status(200).json({message:"Profile Info changed successfully"});
        
    } catch (error) {
         res.status(500).json({message:"Error while changing profile info"});
    }
}



export const passChanges=async(req,res)=>{
         
    try {
         const {adminId}=req.admin;
        const {newPass,oldPass}=req.body;

        //console.log(oldPass,"  ",newPass);

        
     
        const admin=await adminModel.findOne({_id:adminId});

        const isPassswordMatch=await bcrypt.compare(oldPass,admin.password);

        if(isPassswordMatch){
            
            const salt = Number(process.env.SALT_ROUNDS);
            const hashedPass=await bcrypt.hash(newPass,salt);

            admin.password=hashedPass;

            await admin.save();

            return res.status(200).json({message:"Password changed successfully"});

        }else{
            return res.status(500).json({message:"Old password is incorrect"});
        }

        
    } catch (error) {
         res.status(500).json({message:"Error while pass cahnges"});
    }
}