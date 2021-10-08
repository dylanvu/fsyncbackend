import dotenv from 'dotenv'
import mongo from 'mongodb'
import express from 'express'
import { Server } from "socket.io";
import http from 'http'

import { asyncIteratecollection, asyncWritetoCollection, asyncGetBrandsinRetail } from "./mongodb"
import GenerateUniqueRandom from "./randomID"

dotenv.config();

const APP = express();
const PORT = 5000;
const SERVER = http.createServer(APP);

APP.get('/', (req, res) => res.send('Hello World!'));
SERVER.listen(PORT, () => console.log(`Backend listening at http://localhost:${PORT}`));

// Connect to MongoDB, you only have to do this once at the beginning
const mongoclient = new mongo.MongoClient(process.env.MONGO_DB_CONNECTION, { useUnifiedTopology: true, useNewUrlParser: true });
const MongoConnect = async () => {
    try {
        await mongoclient.connect()
    } catch (e) {
        console.error(e);
    }
}

MongoConnect();

// Create socket.io server
const io = new Server(SERVER, {
    cors: { origin: '*' }
})

io.on('connection', (socket) => {
    // Put all socket events here
    console.log("A user has connected! Their socket ID is: " + socket.id);
    // View all sockets in a room
    console.log(io.sockets.adapter.rooms);

    // Insert new retailer to database
    socket.on("createNewcompany", (payload) => {
        // Payload attributes:
        // Email
        // Name
        // Phone number
        // Address
        // Type: Whether it's a brand or not
        let collectionName;
        if (payload.type == "retail") {
            collectionName = "Retailers";
        } else {
            collectionName = "Brands";
        }
        asyncWritetoCollection(mongoclient, payload, collectionName);
    });

    socket.on("GetAllbrands", (payload) => {
        asyncGetBrandsinRetail(mongoclient, socket, payload)
    })
    
})