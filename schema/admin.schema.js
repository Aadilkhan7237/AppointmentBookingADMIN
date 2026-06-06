import { Schema } from "mongoose";


const adminSchema=new Schema({
    fullName:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    phoneNumber:{type:Number,required:true},
})


export {adminSchema};