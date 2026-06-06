import axios from "axios"
import { userModel } from "../models/adminUsers.model.js";
// import { client } from "../RedisCache/client.js";



export const activateUser = async (req, res) => {
  try {

    const { email } = req.body;

    console.log("connecting to user services...........");

    const response = await axios.post(`${process.env.USER_URL}/admin/activateUser`, { userEmail: email });

    const user = await userModel.findOne({ email: email });

    user.activeStatus = true;

    await user.save();

    res.status(200).json({ message: "Activated user successfully" });


  } catch (error) {

    console.log(error);
    res.status(500).json("User activation failed");
  }
}

export const deactivateUser = async (req, res) => {
  try {

    const { email } = req.body;

    // console.log(email);

    // return res.status(200).json({message:"Working"});

    console.log("connecting to user services...........");

    const response = await axios.post(`${process.env.USER_URL}/admin/deactivateUser`, { userEmail: email });

    const user = await userModel.findOne({ email: email });

    user.activeStatus = false;


    await user.save();


    res.status(200).json({ message: "Deactivated user successfully" });


  } catch (error) {

    console.log(error);
    res.status(500).json("User deactivation failed");
  }
}




export const allUser = async (req, res) => {

  try {




    const allUsers = await userModel.find({});

    allUsers.sort((a, b) => a.joinDate - b.joinDate);

    // console.log(allAppointment);




    console.log("DB data sent");
    return res.status(200).json({ allUsers: allUsers });



  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Internal Server Error" });

  }
}







