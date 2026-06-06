import { model } from "mongoose";
import { userSchema } from "../schema/user.schema.js";


const userModel=model("adminUser",userSchema);


export {userModel};