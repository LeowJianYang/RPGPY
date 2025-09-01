const jwt = require("jsonwebtoken");

function authMiddleWare (req,res, next){
    
    const token = req.cookies.jwtAuthToken; // Get the token from Request- Then MAKE SURE MATCH THE token NAME !
    
    // Debug logging
    console.log('Auth Middleware - Cookies received:', req.cookies);
    console.log('Auth Middleware - Token:', token ? 'Present' : 'Missing');
    
    if(!token){
        console.log('Auth Middleware - No token found, returning 401');
        return res.status(401).json({message:"Unauthorized"});
    
    } try{
        const decoded = jwt.verify(token, "secretkey");
        req.user = decoded;
        console.log('Auth Middleware - Token verified for user:', decoded.Email);
        next();
    } catch(err){
        console.log('Auth Middleware - Token verification failed:', err.message);
        return res.status(401).json({message:"Unauthorized, Invalid Token"});
    }

}

module.exports = authMiddleWare;