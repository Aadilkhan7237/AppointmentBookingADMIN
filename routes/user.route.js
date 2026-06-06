import { Router } from "express";
import { activateUser, allUser, deactivateUser } from "../controller/user.controller.js";



export const adminUserRouter=Router();

adminUserRouter.route("/allUser").get(allUser);
adminUserRouter.route("/deactivateUser").post(deactivateUser);
adminUserRouter.route("/activateUser").post(activateUser);


