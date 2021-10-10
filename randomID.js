const GenerateUniqueRandom = (length, setOfid) => {
    let uniqueID = "";
    if (!(setOfid instanceof Set)) {
        console.log("Input is not a set, check randomID.js");
        return "ZZZZ"
    }

    let validChars = '0123456789';
    let numValidchars = validChars.length;
    for (let i = 0; i < length; i++) {
        uniqueID += validChars.charAt(Math.random() * numValidchars);
    }
    while (setOfid.has(uniqueID)) {
        console.log("set contains the id. Trying again")
        uniqueID = "";
        for (let i = 0; i < length; i++) {
            uniqueID += validChars.charAt(Math.random() * numValidchars);
        }
    }
    return uniqueID
}

export default GenerateUniqueRandom