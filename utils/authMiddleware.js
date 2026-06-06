import jwt from "jsonwebtoken";



export const authMiddleware =async (req, res, next) => {

 const token = req.cookies.jwtADMIN;


  if (!token){
     return res.status(401).json({ message: "Not authorized" });
  }

  jwt.verify (token,process.env.SECRET, async (err, admin) => {
    if (err){ 
     return res.status(403).json({ message: "Session timed out" });
    } 
  // console.log(user);
   
    req.admin = admin;
    next();
  });
 

};