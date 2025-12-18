const jwt = require('jsonwebtoken');

const authMiddleware = (req,res,next)=>{
    console.log("auth middleware called");
    const authHeader = req.headers["authorization"];
    console.log(authHeader);
    const token = authHeader && authHeader.split(" ")[1];

    if(!token){
        return res.status(401).json({
            status:false,
            message: "token not found authorize"
        })
    }

    // Decode this toke
    try{
        const decodedTokenInfo = jwt.verify(token,process.env.JWT_SECRET_KEY);
        
        console.log(decodedTokenInfo);
        req.userInfo = decodedTokenInfo;
        next();
    }catch(error){
        return res.status(500).json({
            status:false,
            message: "token not found authorize"
        })
    }

    
}

module.exports = authMiddleware;