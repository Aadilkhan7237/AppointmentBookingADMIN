import { Router } from "express";
import { login, logout, passChanges, profileChange, register, settingInfo } from "../controller/admin.controller.js";
import { authMiddleware } from "../utils/authMiddleware.js";





export const adminRouter=Router();

adminRouter.route("/register").post(register);
adminRouter.route("/login").post(login);
adminRouter.route("/logout").post(logout);
adminRouter.route("/profileChanges").post(authMiddleware,profileChange);
adminRouter.route("/passChanges").post(authMiddleware,passChanges);
adminRouter.route("/settingInfo").get(authMiddleware,settingInfo);


