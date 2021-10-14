import crypto from 'crypto'
import jwt from 'jsonwebtoken'

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

function GenerateJWT(payload) {
    const JWT_TOKEN = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "7 days"})
    return JWT_TOKEN;
}

export { GenerateToken, GenerateJWT };