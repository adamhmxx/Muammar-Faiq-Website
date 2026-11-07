// usage: node tools/hash-password.js "the password"  → prints the ADMIN_PASSWORD_HASH value
const c = require('crypto'), pw = process.argv[2];
if (!pw || pw.length < 10) { console.error('Give a password of at least 10 characters.'); process.exit(1); }
const salt = c.randomBytes(16);
console.log('scrypt$' + salt.toString('hex') + '$' + c.scryptSync(pw, salt, 64).toString('hex'));
