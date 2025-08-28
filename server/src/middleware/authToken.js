const jwt = require("jsonwebtoken");

function authMiddleWare (req,res, next){
    
    const token = req.cookies.jwtAuthToken; // Get the token from Request- Then MAKE SURE MATCH THE token NAME !
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    
    } try{
        const decoded = jwt.verify(token, "secretkey");
        req.user = decoded;
        next();
    } catch(err){
        return res.status(401).json({message:"Unauthorized, Invalid Token"});
    }

}

module.exports = authMiddleWare;