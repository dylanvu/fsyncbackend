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
    const RETAILER = await retailCollection.findOne({
        email: payload
    });

    const DBBRANDS = RETAILER.brandsList;

    let brandList = []

    DBBRANDS.forEach((brand) => {
        let brandEmail = brand.email;
        let currBrand = brandCollection.findOne({
            email: brandEmail
        })
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
    return idList
}

module.exports = { asyncWritetoCollection, asyncIteratecollection, asyncGetBrandsinRetail}