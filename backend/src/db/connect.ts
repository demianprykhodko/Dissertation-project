import Mongoose from 'mongoose';

let database: Mongoose.Connection;

export async function connectToDatabase(url: any) {
    Mongoose.set("strictQuery", false);
    Mongoose.connect(url);

    database = Mongoose.connection;

    database.once("open", async () => {
        console.log("Connected to database");
    });
    database.on("error", () => {
        console.log("Error connecting to database");
    });
}
