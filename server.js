import dotenv from 'dotenv'
import mongo from 'mongodb'
import express from 'express'
import { Server } from "socket.io";
import http from 'http'

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


})