import dotenv from 'dotenv'
import mongo from 'mongodb'
import express from 'express'
import { Server } from "socket.io";
import http from 'http'

import { asyncWritetoCollection, asyncIteratecollection, asyncGetBrandsinRetail, asyncGetretailerProducts, asyncModifyQuantity, asyncGetStock, asyncAddRetailer, asyncAddNewProductBrand } from "./mongodb.js"

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

    // UNIVERSAL SOCKET EVENTS

    // Insert new company to database
    socket.on("createNewcompany", (payload) => {
        // Payload attributes:
            // Email
            // Name
            // Phone number
            // Address
            // Type: Whether it's a brand or not, string?
        let collectionName = checkType(payload.type);
        let databasePayload = {
            name: payload.name,
            phoneNumber: payload.phoneNumber,
            email: payload.email,
            address: payload.address,
            retailerEmails: [],
            products: []
        }
        asyncWritetoCollection(mongoclient, databasePayload, collectionName);
    });

    // View valid retailers selling a specific product 
    socket.on("getValidretail", (payload) => {
        // Payload:
        // selfEmail: String
        // productID: Integer
        // brandID: String
        // Type: Whether it's a brand or not, string?
        let userType = checkType(payload.type);
        asyncGetretailerProducts(mongoclient, socket, payload, userType);
    })

    socket.on("getStock", (payload) => {
        // Payload:
            // retailID: email of retailer
            // brandID: email of brand
            // type: "retail" or "brand"
        let userType = checkType(payload.type);
        asyncGetStock(mongoclient, socket, payload, userType);
    })

    // <---------------- RETAILER SPECIFIC SOCKET EVENTS ----------------------->

    // Get a retailer's brands
    // Function to return the brands associated with the retailer in an object with attributes name and email
    socket.on("GetAllbrands", (payload) => {
        asyncGetBrandsinRetail(mongoclient, socket, payload);
    });

    // Update quantity for a retailer (and globally)
    socket.on("updateQuantity", (payload) => {
        // Payload:
            // productID : id of product to modify
            // brandID : email of brand
            // email: retailer email
            // newQuantity: new quantity
        asyncModifyQuantity(mongoclient, payload);
    });

    // <---------------- BRAND SPECIFIC SOCKET EVENTS ----------------------->
    socket.on("addRetailer", (payload) => {
        // Payload:
            // retailID : email of Retailer
            // brandID : email of brand
        asyncAddRetailer(mongoclient, payload);
    });

    socket.on("createNewproduct", (payload) => {
        // Payload:
            // name : name of product
            // brandID : email of brand

        
    })

})

function checkType(clientType) {
    if (clientType == "retail") {
        return "Retailers";
    } else {
        return "Brands";
    }
}