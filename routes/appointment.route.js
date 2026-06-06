import { Router } from "express";
import {  allAppointments, cancelAppointment, dashboardInfo, latestData, upcomingAppointment } from "../controller/appointment.controller.js";
import { authMiddleware } from "../utils/authMiddleware.js";


export const adminAppointmentRouter=Router();

adminAppointmentRouter.route("/getAppointments").get(allAppointments);
adminAppointmentRouter.route("/getUpcomingAppointments").get(upcomingAppointment);
adminAppointmentRouter.route("/dashboardInfo").get(dashboardInfo);
adminAppointmentRouter.route("/latestData").get(latestData);
adminAppointmentRouter.route("/cancelAppointment").post(cancelAppointment);

