/**
 * CMD Method, get Clients
 */
function GetClients(){

}

GetClients.prototype.exec = function(content, context){
    return new Promise((resolve, reject) => {
        return resolve({event: "Ack__message", data: { 
            response: Object.keys(context.sockets)
                        .map(k => ({id: k, name: context.sockets[k].name, at: context.sockets[k].joinedAt})),
            time: new Date() 
        }})
    })
}

module.exports = function(){
    return new GetClients();
}