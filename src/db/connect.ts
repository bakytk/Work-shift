import mongoose, { connect } from "mongoose";

type TInput = {
  DB_URL: string;
};
export default ({ DB_URL }: TInput) => {
  const konnect = () => {
    connect(DB_URL)
      .then(() => {
        return console.info(`Successfully connected to db`);
      })
      .catch(error => {
        console.error("Error connecting to database: ", error);
        return process.exit(1);
      });
  };
  konnect();

  mongoose.connection.on("disconnected", konnect);
};
