import { model } from "mongoose";
import { adminSchema } from "../schema/admin.schema.js";


const adminModel=model("admin",adminSchema);

export {adminModel};