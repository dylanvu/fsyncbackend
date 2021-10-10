import dotenv from 'dotenv'
import mongo from 'mongodb'
import express from 'express'
import { Server } from "socket.io";
import http from 'http'

import { asyncWritetoCollection, asyncIteratecollection, asyncGetBrandsinRetail, asyncGetretailerProducts, asyncModifyQuantity, asyncGetStock, asyncAddRetailer, asyncAddNewProductBrand, asyncRequestProduct, asyncAddProductinRetail } from "./mongodb.js"
import {ReturnOrder} from "./twilio"

dotenv.config();

const APP = express();
const PORT = 5000;
const SERVER = http.createServer(APP);

APP.get('/', (req, res) => res.send('Hello World!'));
SERVER.listen(PORT, () => console.log(`Backend listening at http://localhost:${PORT}`));

// Connect to MongoDB, you only have to do this once at the beginning
// .env file REQUIRED to run
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

    // On connection, emit an event back to verify that the connection has been made
    // socket.emit("debugConnection", "If you can see this, you can hear me!");

    // Test emission recieve and response
    socket.on("testEmit", (emitMessage) => {
        console.log(emitMessage);
        socket.emit("debugConnection", "If you can see this, you can hear me!")
    })

    // UNIVERSAL SOCKET EVENTS

    // Insert new company to database
    socket.on("createNewcompany", (payload) => {
        // Payload attributes:
            // email
            // name
            // phoneNumber
            // address
            // type: Whether it's a brand or not, "retail" or "brand"
        let collectionName = checkType(payload.type);
        let databasePayload;
        // Define new company based on type
        if (collectionName === "Retailers") {
            databasePayload = {
                email: payload.email,
                name: payload.name,
                phoneNumber: payload.phoneNumber,
                address: payload.address,
                brandsList: []
            }
        } else {
            databasePayload = {
                email: payload.email,
                name: payload.name,
                phoneNumber: payload.phoneNumber,
                address: payload.address,
                retailerEmails: [],
                products: []
            }
        }
        asyncWritetoCollection(mongoclient, databasePayload, collectionName);
    });

    // View valid retailers selling a specific product 
    socket.on("getValidretail", (payload) => {
        // Payload:
            // selfEmail: String
            // productID: Integer
            // brandID: String
            // Type: "retail" or "brand"
        let userType = checkType(payload.type);
        asyncGetretailerProducts(mongoclient, socket, payload, userType);
    })

    // Get stock of a specific retailer or brand
    socket.on("getStock", (payload) => {
        // Payload:
            // retailID: email of retailer
            // brandID: email of brand
            // type: "retail" or "brand"
        let userType = checkType(payload.type);
        asyncGetStock(mongoclient, socket, payload, userType);
    })

    // Request a product from a company
    socket.on("requestProduct", (payload) => {
        // Payload:
            // productID
            // productName
            // brandID
            // target : companyObject
                // id : email
                // type: "brand" or "retail", who is being asked?
            // asker : companyObject
                // id : email
                // type: "brand" or "retail", who is asking?
        let type = {
            target : checkType(payload.target.type),
            asker : checkType(payload.asker.type)
        };

        asyncRequestProduct(mongoclient, payload, type)
    })

    // <---------------- RETAILER SPECIFIC SOCKET EVENTS ----------------------->

    // Get a retailer's brands
    // Function to return the brands associated with the retailer in an object with attributes name and email
    socket.on("GetAllbrands", (payload) => {
        // Payload: retailer ID
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

    socket.on("addProductinRetail", (payload) => {
        // Payload:
            // productID
            // brandID
            // retailerID
        asyncAddProductinRetail(mongoclient, payload);
    })

    socket.on("returnNotice", (payload) => {
        // Payload:
            // brandName
            // brandEmail
            // retailName
        ReturnOrder(retailName, brandName, brandEmail);
    })
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
        asyncAddNewProductBrand(mongoclient, socket, payload);
    })

})

function checkType(clientType) {
    if (clientType === "retail" || clientType === "Retailers") {
        return "Retailers";
    } else {
        return "Brands";
    }
}