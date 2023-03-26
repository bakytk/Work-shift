import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { TokenData } from "./types";
const JWT_SECRET: string = process.env.JWT_SECRET || "";
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET env");
}

import { IUser } from "./types";
import { User, Shift } from "./db/models";
import connect from "./db/connect";
import { DB_URL } from "./db/config";
connect({ DB_URL });

export const controllers = {
  Fallback: async (req, res) => {
    return res.status(405).json({ message: "Invalid endpoint or method" });
  },

  Ping: async (req, res) => {
    console.log("ping req", req);
    return res.status(200).json({ message: "Pong!" });
  },

  Register: async (req, res) => {
    try {
      let { username, password, role } = req.body;
      console.log("req.body", req.body);
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
        access_token: token
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
      console.log("fetched user", user);
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
};
