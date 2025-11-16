const encrypt = require("bcryptjs");

//AES Encryption Key
const Algorithm = 'aes-256-cbc';
const AES_KEY = Buffer.from(process.env.AES_KEY, 'hex'); 
const IV = Buffer.from(process.env.IV, 'hex');

function IdecryptUsername(encryptedUsername){
    const decipher = crypto.createDecipheriv(Algorithm, AES_KEY, IV);
    let decrypted = decipher.update(encryptedUsername, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = {IdecryptUsername};