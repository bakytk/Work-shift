import jwt from "jsonwebtoken";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { TokenData } from "./types";
const JWT_SECRET: string = process.env.JWT_SECRET || "";
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET env");
}

import { IUser } from "./types";
import { User, Shift } from "./db/models";

function stringParser (string, res) {
  let input = string.split("/");
  let year = parseInt(input[0]);
  let month = parseInt(input[1]);
  let day = parseInt(input[2]);
  if (!["0-8", "8-16", "16-24"].includes(input[3])){
    return res.status(406).send("Invalid timeslot");
  }
  let timeSlot = Math.ceil(parseInt(input[3].split("-")[0])/8);
  //console.log("time:", timeSlot, year, month, day);
  //validate date:
  let formatDate = moment([year, month-1, day]).format("YYYY/MM/DD");
  //console.log("formatDate:", formatDate);
  let validDate = moment(formatDate, 'YYYY/MM/DD',true).isValid();
  if (!validDate){
    return res.status(406).send("Date not validated");
  }
  return [year, month-1, day, timeSlot];
}

export const controllers = {
  Fallback: async (req, res) => {
    return res.status(405).json({ message: "Invalid endpoint or method" });
  },

  Ping: async (req, res) => {
    //console.log("ping req", req);
    return res.status(200).json({ message: "Pong!" });
  },

  Register: async (req, res) => {
    try {
      let { username, password, role } = req.body;
      //console.log("req.body", req.body);
      if (!(username && password && role)) {
        return res
          .status(406)
          .send("Either of 'username-password-role' is absent!");
      }
      let userId: string = uuidv4();
      let data = {
        username,
        password,
        userId,
        role
      };
      let usernameMatch = await User.find({
        username
      });
      //console.log("usernameMatch", usernameMatch);
      if (usernameMatch.length > 0) {
        return res.status(401).send("Username already exists!");
      }
      let user = new User({
        ...data
      });
      await user.save();
      let tokenData: TokenData = {
        userId,
        role
      };
      let token: string = jwt.sign(tokenData, JWT_SECRET, { expiresIn: "30m" });
      res.status(201).json({
        message: "Successful registration!",
        access_token: token,
        userId
      });
    } catch (e) {
      console.log("signup error", e);
      res.status(500).send(`Signup error`);
    }
  },

  Login: async (req, res) => {
    /*
      Only admins can login
    */
    try {
      let { username, password } = req.body;
      if (!(username && password)) {
        return res.status(406).send("Username or password absent!");
      }
      let user = await User.find({
        username,
        password
      });
      if (!(user.length > 0)) {
        return res.status(401).send("Username not found!");
      }
      //console.log("fetched user", user);
      let { password: db_password, role, userId } = user[0];
      if (db_password != password) {
        return res.status(401).send("Incorrect password!");
      }
      if (role != "admin") {
        return res.status(401).send("User unauthorized!");
      }
      let tokenData: TokenData = {
        userId,
        role
      };
      let token: string = jwt.sign(tokenData, JWT_SECRET, { expiresIn: "30m" });
      res.json({
        message: "Successful authentication!",
        access_token: token
      });
    } catch (e) {
      console.log("signin error", e);
      res.status(500).send(`Signin error: ${e.message}`);
    }
  },

  CreateShift: async (req, res) => {
    try {
      let { userId: adminId, role } = req.decode;
      if (!(adminId && role === "admin")) {
        return res.status(406).send("'Token not validated");
      }
      if (role !== "admin") {
        return res.status(406).send("Action unauthorized");
      }
      //parse params
      let { userId, timeString } = req.body;
      if (!(userId && timeString)) {
        return res
          .status(406)
          .send(
            "One of required params not passed"
          );
      }
      /*
        parse timeString:
      */
      let [year, month, day, timeSlot] = stringParser(timeString, res);
      let date = new Date(year, month, day);

      /*
        check if there's a shift on this day
      */
      let shiftMatch = await Shift.find({
        userId,
        day: date
      });
      if (shiftMatch.length > 0) {
        return res.status(401).send("Shift already assigned on this day!");
      }
      /*
        create shift
      */
      let shiftId: string = uuidv4();
      let shift = new Shift({
        shiftId,
        userId,
        timeSlot,
        day: date
      });
      console.log("creating shift:", shift);
      await shift.save();
      return res.status(201).json({
        message: "Shift successfully created!",
        shiftId
      });
    } catch (e) {
      console.error("createShift error", e);
      res.status(500).send(`createShift error: ${e.message}`);
    }
  },

  GetShifts: async (req, res) => {
    try {
      let { userId } = req.params;
      if (!userId) {
        return res.status(406).send("'userId' param not passed!");
      }
      //product crud
      let shifts = await Shift.find({ userId });
      console.log("shifts", shifts);
      if (!(shifts.length> 0)) {
        return res.send("Shifts not found!");
      }
      return res.json({
        data: shifts
      });
    } catch (e) {
      console.error("GetShifts error", e);
      res.status(500).send(`GetShifts error: ${e.message}`);
    }
  },

  UpdateTime: async (req, res) => {
    try {
      let { userId: adminId, role } = req.decode;
      if (!(adminId && role === "admin")) {
        return res.status(401).send("User not authorized");
      }
      let { userId, shiftId, timeString } = req.body;
      if (! (userId && shiftId && timeString)) {
        return res.status(406).send("One of required params not passed!");
      }

      /*
        check if shiftId, userId match
      */
      let shiftMatch = await Shift.findOne({ userId, shiftId });
      if (!shiftMatch) {
        return res.status(404).send("Shift-user pair not found!");
      }

      /*
        update
      */
      let [year, month, day, timeSlot] = stringParser(timeString, res);
      let date = new Date(year, month, day);
      await Shift.findOneAndUpdate({ userId, shiftId }, { userId, shiftId, timeSlot, day: date});
      return res.json({ message: "Shift successfully updated!"});
    } catch (e) {
      console.error("putShift", e);
      res.status(500).send(`putShift error: ${e.message}`);
    }
  },

  RemoveShift: async (req, res) => {
    try {
      let { userId, role } = req.decode;
      if (!(userId && role === "admin")) {
        return res.status(401).send("User not authorized");
      }
      let { shiftId } = req.params;
      if (!shiftId) {
        return res.status(406).send("shiftId not passed!");
      }
      let shift = await Shift.findOne({shiftId});
      if (!shift) {
        return res.status(404).send("shiftId not found!");
      }
      await Shift.deleteOne({ shiftId });
      return res.json({ message: "Shift successfully deleted!" });
    } catch (e) {
      console.error("deleteProduct error", e);
      return res.status(500).send(`deleteProduct error: ${e.message}`);
    }
  },
};
