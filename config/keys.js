const prodKeys = require('./keys_prod');

if (process.env.NODE_ENV === 'production') {
    module.exports = prodKeys;
} else {
    module.exports = require('./keys_dev');
}
