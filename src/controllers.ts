import jwt from "jsonwebtoken";
import { TokenData } from "./types";
const JWT_SECRET: string = process.env.JWT_SECRET || "";
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET env");
}

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
      let { username, password } = req.body;
      console.log("req.body", req.body);
      if (!(username && password)) {
        return res
          .status(406)
          .send("Either of 'username or password' is absent!");
      }
      let data = {
        username,
        password
      };
      // let user = new User({
      //   ...data
      // });
      // await user.save();
      let tokenData: TokenData = {
        username
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
  }
};
