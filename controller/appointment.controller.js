import axios from "axios";
import { appointmentModel } from "../models/adminAppointment.model.js";
import { cancelNotification } from "../utils/cancellationNotification.js";
import { userModel } from "../models/adminUsers.model.js";
// import { client } from "../RedisCache/client.js";



export const allAppointments = async (req, res) => {
  try {




    const allAppointment = await appointmentModel.find({});

    allAppointment.sort((a, b) => a.appointmentDate - b.appointmentDate);

    // console.log(allAppointment);




    console.log("DB data sent");
    return res.status(200).json({ DBappointment: allAppointment });






  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error" });
  }
}

export const dashboardInfo = async (req, res) => {
  try {


    const Appointments = await appointmentModel.find({});
    const Users = await userModel.find({});

    const totalAppointment = Appointments.length;
    const registeredUsers = Users.length;

    // ✅ Get chart data (helper function returns pure data, not response)
    const chartData = await getChartData();

    const infoObj = {
      totalAppointment,
      registeredUsers,
      chartData
    }

    console.log(infoObj);


    console.log("DB data sent");
    res.status(200).json({
      info: infoObj
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard info" });
  }
};

//  Helper function – returns only data (no req/res)
const getChartData = async () => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    console.log(startOfWeek);
    console.log(endOfWeek);

    const data = await appointmentModel.aggregate([
      {
        $match: {
          dateBooked: { $gte: startOfWeek, $lt: endOfWeek },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$dateBooked" }, // ✅ correct
          totalBookings: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Map Mongo day numbers → readable labels
    // const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const formatted = Array(7)
      .fill(0)
      .map((_, i) => {
        const found = data.find((d) => d._id === i + 2);
        return found ? found.totalBookings : 0;
      });

    console.log("Yielded Data ", formatted);
    return {
      data: formatted,
    };
  } catch (error) {
    console.log(error);
    return { data: [] };
  }
};




export const cancelAppointment = async (req, res) => {
  const { appointmentUniqueID } = req.body;

  console.log(appointmentUniqueID);
  // return res.status(200).json("Working");
  try {
    // console.log("contacting appointment microservice");
    const response = await axios.post(`${process.env.APPOINTMENT_URL}/admin/cancelAppointment`, { uniqueID: appointmentUniqueID });
    console.log(response);
    console.log("working correctly");
    const appointment = await appointmentModel.findOne({ uniqueID: appointmentUniqueID });

    console.log(appointment);

    appointment.confirmStatus = false;

    await appointment.save();

    // await localLatestAppointments();

    res.status(200).json({ message: "Cancelled the appointment " });
    await cancelNotification(appointment);

  } catch (error) {
    // console.log(error);
    if (error.code === 'ERR_BAD_RESPONSE') {
      return res.status(500).json({ message: "Appointment cancelled by user try fetching latest data" });
    }
    res.status(500).json({ message: "Appointment cancellation failed" });
  }
};

export const pastAppointment = async (req, res) => {
  try {
    const allAppointments = await appointmentModel.find({});

    const filteredAppointments = allAppointments.filter((item) => {
      return item.appointmentDate < new Date(Date.now());
    });

    res.status(200).json({ message: filteredAppointments });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
};





export const upcomingAppointment = async (req, res) => {
  try {
    const allAppointments = await appointmentModel.find({});

    const filteredAppointments = allAppointments.filter((item) => {
      return item.appointmentDate > new Date(Date.now());
    });


    filteredAppointments.sort((a, b) => a.appointmentDate - b.appointmentDate);

    res.status(200).json({ message: filteredAppointments });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
};




export const latestData = async (req, res) => {
  console.log("request received for appointments");
  try {

    await appointmentModel.deleteMany({});
    console.log("Deleted old appointments");
    const allAppointment = await fetchAppointments();

    if (!allAppointment) {
      return res.status(400).json("Cannot fetch data");
    }




    const todayDay = new Date().toISOString().slice(0, 10);

    //console.log(allAppointment);
    await Promise.all(
      allAppointment.map((appointment) => {

        const appointmentDay = appointment.appointmentDate.slice(0, 10); // YYYY-MM-DD
        const isOld = appointmentDay < todayDay;

        const newAppointment = new appointmentModel({
          appointmentID: appointment._id,
          patientName: appointment.patientName,
          phoneNumber: appointment.phoneNumber,
          email: appointment.email,
          emergencyContact: appointment.emergencyContact,
          appointmentDate: appointment.appointmentDate,
          confirmStatus: appointment.confirmStatus,
          bookedBy: appointment.bookedBy,
          isOld: isOld,
          dateBooked: appointment.dateBooked,
          slotNumber: appointment.slotNumber,
          uniqueID: appointment.uniqueID,
        });

        return newAppointment.save();
      })
    );




    //Populating Users DB
    await userModel.deleteMany({});
    console.log("received request for users");
    console.log("connecting user microservices..........");

    const allUsers = await fetchUsers();

    if (!allUsers) {
      return res.status(400).json({ message: "Cannot fetch users" });
    }


    await Promise.all(allUsers.map(async (eachUser) => {

      const newUser = new userModel({
        userID: eachUser._id,
        fullName: eachUser.fullName,
        email: eachUser.email,
        joinDate: eachUser.joinDate,
        activeStatus: eachUser.activeStatus,
      });

      return newUser.save();
    }));




    //console.log(allAppointment);

    res.status(200).json({ message: "Fetched latest data " });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
    console.log(error);
  }
};

const fetchAppointments = async () => {
  try {
    console.log("contacting appointment microservice");
    const res = await axios.get(`${process.env.APPOINTMENT_URL}/admin/allAppointment`);
    console.log(res);
    console.log("working correctly");
    return res.data.message; // Now this actually returns data
  } catch (error) {
    return null;
  }
};


const fetchUsers = async () => {
  try {
    console.log("contacting user microservice");
    const res = await axios.get(`${process.env.USER_URL}/admin/allUser`);
    console.log(res);
    console.log("working correctly");

    return res.data.message; // Now this actually returns data
  } catch (error) {
    return null;
  }
};









