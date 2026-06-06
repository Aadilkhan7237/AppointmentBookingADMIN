import { Schema } from "mongoose";

const appointmentSchema=new Schema({
     appointmentID:{type:String,required :true},
     patientName:{type:String,required:true},
     phoneNumber:{type:Number,required:true},
     email:{type:String,required:true},
     emergencyContact:{type:Number},
     appointmentDate:{type:Date,required:true},
     bookedBy:{type:String, required:true},
     isOld:{type:Boolean,required:true},
     confirmStatus:{type:Boolean,required:true},
     dateBooked:{type:Date,required:true},
     slotNumber:{type:Number,required:true},
     uniqueID:{type:String,required:true},
});



export {appointmentSchema};