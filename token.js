import crypto from 'crypto'

function GenerateToken(tokenSet) {
    if (!(tokenSet instanceof Set)) {
        console.log("Input is not a set, check token.js");
        return "ZZZZ"
    }
    let token = "";
    crypto.randomBytes(48, function(err, buffer) {
        token = buffer.toString('hex')
    });
    // Continue generating tokens if it already exists
    while (tokenSet.has(token)) {
        crypto.randomBytes(48, function(err, buffer) {
            token = buffer.toString('hex')
        });
    }
    return token;
}

export default GenerateToken;