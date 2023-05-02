import Mongoose from 'mongoose';

let database: Mongoose.Connection;

export async function connectToDatabase(url: any) {
    Mongoose.set("strictQuery", false); // To allow querying on non-schema fields
    Mongoose.connect(url); // Connect to the database

    database = Mongoose.connection; // Store the database connection

    database.once("open", async () => { // When the database connection is open
        console.log("Connected to the database"); // Log that the connection is open
    });
    database.on("error", () => { // If there is an error connecting to the database
        console.log("Error connecting to database"); // Log the error
    });
}
