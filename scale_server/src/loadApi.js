const fs = require('fs');

module.exports = function(context, app, mids){
    const prefix = "api."
    fs.readdirSync(__dirname)
        .filter(file => {
            return (file.slice(0,4) === prefix)
        }).forEach(file => {
            require(`./${file}`)(context, app, mids);
        });
}