// let brandCollection = mongoclient.db().collection("Brands");
// let retailCollection = mongoclient.db().collection("Retailers");

import { WelcomeCompany, AddedByBrand, RequestEmail } from "./twilio.js"
import GenerateUniqueRandom from "./randomID.js"

export async function asyncAddProductinRetail(mongoclient, payload) {
    // Function to push a product ID into a retailer inventory
    // Payload:
        // productID
        // brandID
        // retailerID
    try {
        await AddProductinRetail(mongoclient, payload);
    } catch (e) {
        console.error(e);
    } finally {
        // Pass
    }
}

async function AddProductinRetail(mongoclient, payload) {
    let productID = payload.productID;
    let brandEmail = payload.brandID;
    let retailEmail = payload.retailerID;

    let brandCollection = mongoclient.db().collection("Brands");
    let retailCollection = mongoclient.db().collection("Retailers");
    console.log(payload)
    let duplicate = await getProductfromRetailandBrand(retailCollection, retailEmail, brandEmail, productID, true);
    // console.log("obtained")
    // Check if the product already exists in the stock
    if (!duplicate) {
        // If it doesn't, add it in
        console.log("No duplicate in retailer inventory")
        // Check to see if the brand has the product

        let product = await getProductfromRetailandBrand(brandCollection, brandEmail, brandEmail, productID, false);
        if (product) {
            // If the product exists, push to retailer
            // console.log("Product in brand inventory")
            // console.log(product)
            // console.log(product.name)
            let productName = product.name;
            console.log(productName)
            let newProduct = {
                id: productID,
                quantity: 0,
                name: productName
            }
            const RETAIL_QUERY = { email : retailEmail }
            const pushRetailProduct = {
                $push: { "brandsList.$[brandItem].products" : newProduct }
            }
            const retailOptions = {
                arrayFilters: [{
                    "brandItem.email" : brandEmail
                }]
            }
            const RETAIL_UPDATE_RESULT = await retailCollection.updateOne(RETAIL_QUERY, pushRetailProduct, retailOptions);
            console.log("Addition to retailer successful")
        } else {
            console.log("Product not found in brand")
        }
    } else {
        console.log("Duplicate item exists")
    }
}

export async function asyncRequestProduct(mongoclient, payload, typeObject) {
    // Function to use Twilio API to send an email to request for a product
    // payload:
        // productID
        // productName
        // brandID
        // target : companyObject
            // id : email
            // type: "brand" or "retail", who is being asked?
        // asker : companyObject
            // id : email
            // type: "brand" or "retail", who is asking?
    // typeObject
        // target : "Retailers" or "Brands"
        // asker : same as above ^^^
    try {
        await RequestProduct(mongoclient, payload, typeObject);
    } catch(e) {
        console.error(e)
    } finally {
        // Pass
    }
}

async function RequestProduct(mongoclient, payload, typeObject) {
    let askerID = payload.asker.id;
    let targetID = payload.target.id;
    const ASKER = await GetCompanySmart(mongoclient, askerID, typeObject.asker);
    const TARGET = await GetCompanySmart(mongoclient, targetID, typeObject.target);

    // Pull out the names
    let askerName = ASKER.name;
    let targetName = TARGET.name;

    await RequestEmail(askerName, askerID, targetName, targetID, payload.productName, payload.productID, typeObject);
}

export async function asyncAddNewProductBrand(mongoclient, socket, payload) {
    // Function to add a new line of products in a brand / new product / add new product
    // Payload:
        // name : name of product
        // brandID : email of brand
    try {
        await AddNewProductBrand(mongoclient, payload);
    } catch (e) {
        console.error(e);
    } finally {
        // Pass
    }
}

async function AddNewProductBrand(mongoclient, payload) {
    console.log(payload)
    let brandCollection = mongoclient.db().collection("Brands");
    let brandEmail = payload.brandID;
    let productName = payload.name;

    const BRAND = await getCompany(brandCollection, brandEmail);
    let existingProducts = BRAND.products;

    // Create set of existing product IDs to generate a random unique product ID
    let productSet = new Set()
    existingProducts.forEach((product) => {
        productSet.add(product.id);
    })
    console.log(productSet)

    // Generate unique ID
    let newID = GenerateUniqueRandom(4, productSet);
    console.log("New productID is: " + newID)

    let newProduct = {
        id : newID,
        name : productName,
        quantity : 0
    }

    const BRAND_QUERY = { email : brandEmail }
    const updateBrandProducts = {
        $push: { "products" : newProduct }
    }
    const BRAND_UPDATE_RESULT = await brandCollection.updateOne(BRAND_QUERY, updateBrandProducts);
    console.log("New product upload successful")
}

export async function asyncAddRetailer(mongoclient, payload) {
    // Function to add retailer to brand database and to retailer database
    // Payload:
        // retailID : email of Retailer
        // brandID : email of brand
    try {
        await AddRetailer(mongoclient, payload);
    } catch (e) {
        console.error(e);
    } finally {
        // pass
    }
}

async function AddRetailer(mongoclient, payload) {

    let brandEmail = payload.brandID;
    let retailEmail = payload.retailID;

    if (retailEmail === "") {
        console.log("retail email is blank, check addRetailer? Or user error.");
        return
    }

    let brandCollection = mongoclient.db().collection("Brands");
    let retailCollection = mongoclient.db().collection("Retailers");

    // Add retailer on brand database
    // First check if the retailer has already been added
    const BRAND = await getCompany(brandCollection, brandEmail);
    const BRAND_NAME = BRAND.name;
    const RETAILER_LIST = BRAND.retailerEmails;

    if (RETAILER_LIST.includes(retailEmail)) {
        console.log("Trying to add a retailer that already exists in brand");
    } else {
        const BRAND_QUERY = { email : brandEmail }
        const updateBrandRetailer = {
            $push: { "retailerEmails" : retailEmail }
        }
        const BRAND_UPDATE_RESULT = await brandCollection.updateOne(BRAND_QUERY, updateBrandRetailer);

        // Add brand on retailer end
        // Check if the brand is already in the retailer end

        const RETAILER = await getCompany(retailCollection, retailEmail);
        // Check if it was found:
        if (RETAILER) {
            const RETAILER_NAME = RETAILER.name;
            const RETAIL_QUERY = {email : retailEmail}
            const updateRetailerBrands = {
                $push : {
                    "brandsList" : {
                        "email" : brandEmail,
                        "products" : [{}]
                    }
                }
            }
            const RETAIL_UPDATE_RESULT = await retailCollection.updateOne(RETAIL_QUERY, updateRetailerBrands);
            // TODO: Reenable Twilio
            console.log("Insert Twilio email. (No email actually sent). This was sent to " + retailEmail + " by " + BRAND_NAME);
            // await AddedByBrand(retailEmail, RETAILER_NAME, BRAND_NAME);
        } else {
            console.log("Adding retailer but wasn't found");
        }
    }

}

export async function asyncGetStock(mongoclient, socket, payload, userType) {
    // Function to retreive the stock of a specific retailer
    // Emits out a list of product objects
    // Payload:
        // retailID: email of retailer
        // brandID: email of brand
    // type: "Retailers" or "Brands" string
    try {
        await GetStock(mongoclient, socket, payload, userType);
        // inventory: Array of product objects
            // id
            // quantity
            // name
        
    } catch (e) {
        console.error(e);
    } finally {
        // pass
    }
}

async function GetStock(mongoclient, socket, payload, userType) {

    let isRetail;

    userType === "Retailers" ? isRetail = true : isRetail = false

    let brandEmail = payload.brandID;

    if (isRetail) {
        let retailCollection = mongoclient.db().collection("Retailers");
        let retailerEmail = payload.retailID;
    
        // Get retailer from retailer database/collection
        const RETAILER = await getCompany(retailCollection, retailerEmail);
    
        let validBrandarray = RETAILER.brandsList.filter(e => e.email === brandEmail);
        if (validBrandarray.length > 0) {
            const BRAND = validBrandarray[0];
            socket.emit("updateStock", BRAND.products); // Array of product objects
            // TODO: THERE IS NO NAME??? Address this when adding a product to the database from the retailer side...
        } else {
            console.log("No brand found when getting stock");
        }
    } else {
        // A brand is requesting its global product quantity
        let brandCollection = mongoclient.db().collection("Brands");
        const BRAND = await getCompany(brandCollection, brandEmail);
        socket.emit("updateStock", BRAND.products); // Array of product objects
    }
    
}

export async function asyncModifyQuantity(mongoclient, payload) {
    // Function to modify the quantity / update the quantity / update quantity of a product in the database
    // Payload:
        // productID : id of product to modify
        // brandID : email of brand
        // email: retailer email
        // newQuantity: new quantity
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

    let productID = payload.productID;
    let retailerEmail = payload.email;
    let brandEmail = payload.brandID;
    let newQuantity = payload.newQuantity;

    // Modify the retail side first
    // Get original quantity from database
    let stockInventory = 0;
    let retailProduct = null;
    retailProduct = await getProductfromRetailandBrand(retailCollection, retailerEmail, brandEmail, productID, true);
    if (retailProduct) {
        stockInventory = retailProduct.quantity;
    }
    // const RETAILER_DB = await getCompany(retailCollection, retailer);
    // let validBrandarray = RETAILER_DB.brandsList.filter(e => e.email === brandEmail);
    // if (validBrandarray.length > 0) {
    //     // Extract the product out if it exists
    //     let products = validBrandarray[0].products.filter(e => e.id === productID);

    //     // This means that we have the product in the products array
    //     if (products.length > 0) {
    //         stockInventory = products[0].quantity;
    //     }
    // }
    let difference = stockInventory - newQuantity;

    // Useful link: https://www.youtube.com/watch?v=XRXjJRJ03_A
    // https://docs.mongodb.com/drivers/node/current/fundamentals/crud/write-operations/embedded-arrays/#std-label-filtered-positional-operator
    const retailQuery = {email: retailerEmail};

    const updateRetailQuantity = {
        $set: {"brandsList.$[brandItem].products.$[productItem].quantity" : newQuantity}
    }

    const retailOptions = {
        arrayFiters: [{
            "brandItem.email" : brandEmail,
            "productItem.id" : productID
        }]
    }
    const retailResult = await retailCollection.updateOne(retailQuery, updateRetailQuantity, retailOptions);

    // Modify the brand side

    const DB_BRAND = await getCompany(brandCollection, brandEmail);
    let globalQuantity;
    let currProduct = DB_BRAND.products.filter(e => e.id === productID);
    if (currProduct.length > 0) {
        globalQuantity = currProduct[0].globalQuantity;
    }

    const brandQuery = {email : brandEmail}

    const updateBrandquantity = {
        $set: {"products.$[productItem].globalQuantity" : globalQuantity - difference} // globalQuantity - difference // Look into $inc instead
    }

    const brandOptions = {
        arrayFilters: [{
            "productItem.id" : productID
        }]
    }

    const brandResult = await brandCollection.updateOne(brandQuery, updateBrandquantity, brandOptions);

}

export async function asyncGetretailerProducts(mongoclient, socket, payload, userType) {
    // Function to return the brands associated with the retailer
    // Payload:
        // selfEmail: String
        // productID: Integer
        // brandID: String
    try {
        // Connect to MongoDB Cluster
        //await mongoclient.connect();
        await GetRetailerProducts(mongoclient, socket, payload, userType);
        // retailerList: array of objects
            // name : retailer name,
            // email : retailer email
            // quantity : specific product quantity
        
    } catch (e) {
        console.error(e);
    } finally {
        //await mongoclient.close();
    }
}

async function GetRetailerProducts(mongoclient, socket, payload, userType) {

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
    let brandEmail = payload.brandID;

    let brandCollection = mongoclient.db().collection("Brands");
    let retailCollection = mongoclient.db().collection("Retailers");

    const DB_BRAND = await getCompany(brandCollection, brandEmail);

    const DB_BRAND_RETAILER = DB_BRAND.retailerEmails;

    let retailerList = [];

    let counter = 0;
    let maxCounter = DB_BRAND_RETAILER.length

    DB_BRAND_RETAILER.forEach(async (retailer) => {
        // Check if the caller is a retailer, and ignore itself
        counter++;
        if (isRetail && (retailer === selfEmail)) {
            // Do nothing
        } else {
            // Look up the retailer in the retail DB
            const RETAILER_DB = await getCompany(retailCollection, retailer);
            // Double check if the brand is in the retailer
            let validBrandarray = RETAILER_DB.brandsList.filter(e => e.email === brandEmail);
            if (validBrandarray.length > 0) {
                // Extract the product out if it exists
                let products = validBrandarray[0].products.filter(e => e.id === productID);

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
        if (counter === maxCounter) {
            socket.emit("yourRetailers", retailerList);
        }
    })
    // return retailerList;
}

export async function asyncGetBrandsinRetail(mongoclient, socket, payload) {
    // Function to return the brands associated with the retailer in an object with attributes name and email
    // Payload: retailer ID
    try {
        // Connect to MongoDB Cluster
        //await mongoclient.connect();
        await GetBrandsinRetail(mongoclient, socket, payload);
        // brandList:
            // name
            // email
        
    } catch (e) {
        console.error(e);
    } finally {
        //await mongoclient.close();
    }
}

async function GetBrandsinRetail(mongoclient, socket, payload) {
    // Function to return the brands associated with the retailer
    // Payload: retailer ID
    console.log("Requesting Brands by a retailer: " + payload);
    let retailCollection = mongoclient.db().collection("Retailers");
    let brandCollection = mongoclient.db().collection("Brands");

    // Get retailer
    const RETAILER = await getCompany(retailCollection, payload);
    // const RETAILER = await retailCollection.findOne({
    //     email: payload
    // });

    const DBBRANDS = RETAILER.brandsList;
    // console.log("Aloha")
    // console.log(DBBRANDS)

    let brandList = []

    let counter = 0;
    let maxCounter = DBBRANDS.length;

    DBBRANDS.forEach(async (brand) => {
        console.log(brand)
        let brandEmail = brand.email;
        let currBrand = await getCompany(brandCollection, brandEmail);
        let someBrand = {
            name : currBrand.name,
            email : brandEmail
        }
        // console.log(someBrand)
        brandList.push(someBrand);
        counter++;
        if (counter === maxCounter) {
            console.log(brandList);
            socket.emit("yourBrands", brandList);
            return brandList;
        }
    });
    
}

export async function asyncWritetoCollection(mongoclient, payload, collectionName) {
    // Create new company
    // Function to add a new company to MongoDB
    try {
        // Connect to MongoDB Cluster
        //await mongoclient.connect();
        // Payload attributes:
            // See JSON sample
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
    // TODO: reeenable Twilio
    console.log("Twilio substitute. This welcome email was sent to " + payload.email);
    // await WelcomeCompany(payload.email, payload.name);
    // console.log(collection)
}


// Function to iterate through some collection and get a list
// THIS WILL NOT WORK CUZ OF FOREACH BEING ASYNC AND SOCKET HAVEN'T FIXED
export async function asyncIteratecollection(mongoclient, socket, collectionName) {
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

// <------------ Utility Functions -------------->
async function getCompany(collection, uniqueID) {
    const COMPANY = await collection.findOne({
        email: uniqueID
    });
    if (COMPANY) {
        return COMPANY;
    } else {
        console.log("Company not found, looking for " + uniqueID + ". If blank, it's null.");
        return null;
    }
    
}

async function GetCompanySmart(mongoclient, companyID, type) {
    // Like get company, but feed in a type and the ID
    if (type === "Retailers" || type === "retail") {
        let retailCollection = mongoclient.db().collection("Retailers");
        return getCompany(retailCollection, companyID);
    } else {
        let brandCollection = mongoclient.db().collection("Brands");
        return getCompany(brandCollection, companyID);
    }
}

async function getProductfromRetailandBrand(collection, companyID, brandID, productID, isRetail) {
    // This function returns a product from the RETAILER INVENTORY or a BRAND INVENTORY
    // The object will have:
        // id : the product ID
        // quantity: the quantity
        // name: the name

    // RETAIL INVENTORY

    const COMPANY = await getCompany(collection, companyID);

    if (isRetail) {
        // Double check if the brand is in the retailer
        let validBrandarray = COMPANY.brandsList.filter(e => e.email === brandID);
        // console.log("SUP", validBrandarray, validBrandarray.products)
        if (validBrandarray.length > 0) {
            // Extract the product out if it exists
            let products = validBrandarray[0].products.filter(e => e.id === productID);
            // This means that we have the product in the products array
            // console.log("HI", products)
            if (products.length > 0) {
                return products[0]; // Return a product object
            } else {
                console.log("No valid product found in retail");
                return null;
            }
        } else {
            console.log("No valid brands found in retail");
        }
    } else {
        // BRAND INVENTORY
        // Extract a product out
        let validProduct = COMPANY.products.filter(e => e.id === productID);
        if (validProduct.length > 0) {
            return validProduct[0]
        } else {
            console.log("Product not found in brand");
            return null;
        }
    }
    
}