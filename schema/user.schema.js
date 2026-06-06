import { Schema } from "mongoose";

const userSchema=new Schema({
    userID:{type:String,required:true},
    fullName:{type:String,required:true},
    email:{type:String ,required:true},
    joinDate:{type:Date,required:true},
    activeStatus:{type:Boolean,required:true},
});


export {userSchema};