const GenerateUniqueRandom = (length, setOfid) => {
    // let uniqueID = "";
    if (!(setOfid instanceof Set)) {
        console.log("Input is not a set, check randomID.js");
        return "ZZZZ"
    }
    let uniqueID = Math.floor(1000 + Math.random() * 9000);
    // let validChars = '0123456789';
    // let numValidchars = validChars.length;
    // for (let i = 0; i < length; i++) {
    //     uniqueID += validChars.charAt(Math.random() * numValidchars);
    // }
    while (setOfid.has(uniqueID)) {
        console.log("set contains the id. Trying again")
        // uniqueID = "";
        // for (let i = 0; i < length; i++) {
        //     uniqueID += validChars.charAt(Math.random() * numValidchars);
        // }
        uniqueID = Math.floor(1000 + Math.random() * 9000);
    }
    return uniqueID
}

export default GenerateUniqueRandom