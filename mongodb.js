// let brandCollection = mongoclient.db().collection("Brands");
// let retailCollection = mongoclient.db().collection("Retailers");

async function asyncModifyQuantity(mongoclient, payload) {
    // Function to modify the quantity of a product in the database
    try {
        await ModifyQuantity(mongoclient, payload);
    } catch (e) {
        console.error(e);
    } finally {
        //await mongoclient.close();
    }
}

async function ModifyQuantity(mongoclient, payload) {
    let brandCollection = mongoclient.db().collection("Brands");
    let retailCollection = mongoclient.db().collection("Retailers");
}

async function asyncGetretailerProducts(mongoclient, socket, payload, userType) {
    // Function to return the brands associated with the retailer
    // Payload:
    // selfEmail: String
    // productID: Integer
    // brandEmail: String
    try {
        // Connect to MongoDB Cluster
        //await mongoclient.connect();
        let retailerList = await GetRetailerProducts(mongoclient, payload, userType);
        socket.emit("yourRetailers", retailerList);
    } catch (e) {
        console.error(e);
    } finally {
        //await mongoclient.close();
    }
}

async function GetRetailerProducts(mongoclient, payload, userType) {

    // Check if the thing calling this is a brand or a retailer
    // If there are issues, double check the checkType function in server.js
    let selfEmail = payload.selfEmail;
    let isRetail;

    userType === "Retailers" ? isRetail = true : isRetail = false
    // if (userType == "Retailers") {
    //     isRetail = true;
    // } else {
    //     isRetail = false
    // }

    let productID = payload.productID;
    let brandEmail = payload.brandEmail;

    let brandCollection = mongoclient.db().collection("Brands");
    let retailCollection = mongoclient.db().collection("Retailers");

    const DB_BRAND = await getCompany(brandCollection, retailCollection);

    const DB_BRAND_RETAILER = DB_BRAND.retailerEmails;

    let retailerList = [];

    DB_BRAND_RETAILER.forEach((retailer) => {
        // Check if the caller is a retailer, and ignore itself
        if (isRetail && (retailer === selfEmail)) {
            // Do nothing
        } else {
            // Look up the retailer in the retail DB
            const RETAILER_DB = await getCompany(retailCollection, retailer);
            // Double check if the brand is in the retailer
            let validBrandarray = RETAILER_DB.brandsList.filter(e => e.email === brandEmail);
            if (validBrandarray.length > 0) {
                // Extract the product out if it exists
                let products = validBrandarray.products.filter(e => e.id === productID);

                // This means that we have the product in the products array
                if (products.length > 0) {
                    let newValid = {
                        name : RETAILER_DB.name,
                        email : retailer,
                        quantity : products[0].quantity
                    }
                    // Add relevant info to the retail object
                    retailerList.push(newValid);
                }
            }
        }
    })
    return retailerList;
}

async function asyncGetBrandsinRetail(mongoclient, socket, payload) {
    // Function to return the brands associated with the retailer
    // Payload: retailer ID
    try {
        // Connect to MongoDB Cluster
        //await mongoclient.connect();
        let brandList = await GetBrandsinRetail(mongoclient, payload);
        socket.emit("yourBrands", brandList);
    } catch (e) {
        console.error(e);
    } finally {
        //await mongoclient.close();
    }
}

async function GetBrandsinRetail(mongoclient, payload) {
    // Function to return the brands associated with the retailer
    // Payload: retailer ID
    let retailCollection = mongoclient.db().collection("Retailers");
    let brandCollection = mongoclient.db().collection("Brands");

    // Get retailer
    const RETAILER = await getCompany(retailCollection, payload);
    // const RETAILER = await retailCollection.findOne({
    //     email: payload
    // });

    const DBBRANDS = RETAILER.brandsList;

    let brandList = []

    DBBRANDS.forEach((brand) => {
        let brandEmail = brand.email;
        let currBrand = await getCompany(brandCollection, brandEmail);
        brandList.push(currBrand.name);
    });

    return brandList;
}

async function asyncWritetoCollection(mongoclient, payload, collectionName) {
    // Function to add a new company to MongoDB
    try {
        // Connect to MongoDB Cluster
        //await mongoclient.connect();
        await writeTocollection(mongoclient, payload, collectionName);
    } catch (e) {
        console.error(e);
    } finally {
        //await mongoclient.close();
    }
}

async function writeTocollection(mongoclient, payload, collectionName) {
    // See: https://docs.mongodb.com/drivers/node/current/fundamentals/crud/write-operations/insert/
    let collection = await mongoclient.db().collection(collectionName);
    collection.insertOne(payload);
    // console.log(collection)
}


// Function to iterate through some collection and get a list
async function asyncIteratecollection(mongoclient, socket, collectionName) {
    try {
        let payload = await iterateCollection(mongoclient, collectionName);
        socket.emit("someList", payload);
    } catch (e) {
        console.error(e);
    } finally {
        //await mongoclient.close();
    }
}

async function iterateCollection(mongoclient, collectionName) {
    let collection = await mongoclient.db().collection(collectionName);
    let allCursor = await collection.find();
    let idList = [];
    await allCursor.forEach((document) => {
        idList.push(document._id);
    })
    // console.log(idList)
    return idList;
}

// <------------ General Use Functions -------------->
async function getCompany(collection, uniqueID) {
    const COMPANY = await collection.findOne({
        email: uniqueID
    });
    return COMPANY
}

module.exports = { asyncWritetoCollection, asyncIteratecollection, asyncGetBrandsinRetail, asyncGetretailerProducts}