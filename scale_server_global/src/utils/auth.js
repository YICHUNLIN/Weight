
function Auth(){
    console.log('load auth module successed')
}


//如果有某個權限就執行cb,不然就next
Auth.prototype.pmsSelectorInturrupt = function (permission, cb) {
    return function(req, res, next){
        const ps = req.loginState.permissions.map(p => p.name);
        if (!ps.includes(permission)) return next();
        return cb(req, res, next)
    }
}

Auth.prototype.checkPermissionOR = function(permissions){
    return function(req, res, next){
        if (req.ticket) {
            let r = false;
            const userPs = req.loginState.permissions.map(p => p.name);
            permissions.forEach(p => {
                if (userPs.includes(p)) r = true;
            })
            return r ? next() : res.status(400).json({code: 400, message: 'permission not allow'});
        }
        return res.status(400).json({code: 400, message: 'not found ticket'})
    }
}

Auth.prototype.checkPermission = function(permission){
    return function(req, res, next){
        const ps = req.loginState.permissions.map(p => p.name);
        if (!ps.includes(permission)) return res.status(400).json({code: 400, message: 'permission not allow'})
        return next();
    }
}




module.exports = Auth;