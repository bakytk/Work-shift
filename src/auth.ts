import jwt from "jsonwebtoken";

export const authenticate = secret => (req, res, next) => {
  let authHeader = req.headers["authorization"] || "";
  let token = "";
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7, authHeader.length);
  }
  if (!token) {
    return res.status(401).json({
      error: "No auth header or not Bearer type"
    });
  } else {
    jwt.verify(token, secret, function(err, decode) {
      if (err) {
        return res.status(401).json({ error: "Invalid token" });
      } else {
        //console.log("decode", decode);
        req.decode = decode;
        next();
      }
    });
  }
};
