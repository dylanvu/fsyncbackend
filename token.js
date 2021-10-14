import crypto from 'crypto'
import jwt from 'jsonwebtoken'

function GenerateToken(tokenSet, idSet) {
    // Return two strings, one is the token and one is the id
    // Do some error checking
    if (!(tokenSet instanceof Set)) {
        console.log("TokenSet is not a set, check token.js");
        return ["ZZZZ", "ZZZZ"];
    }
    if (!(idSet instanceof Set)) {
        console.log("IDSet is not a set, check token.js");
        return ["ZZZZ", "ZZZZ"];
    }
    let token = GetRandomUnique(tokenSet)

    let id = GetRandomUnique(idSet)
    return [token, id];
}

function GenerateJWT(payload) {
    const JWT_TOKEN = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "7 days"})
    return JWT_TOKEN;
}

function GetRandomUnique(uniqueSet) {
    let token = "";
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

export { GenerateToken, GenerateJWT };