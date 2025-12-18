

const isAdminUser = (req,res,next)=>{
    if(req.userInfo.role != 'admin'){

        res.status(403).json({
            status:"false",
            message: "only admin is allow!"
        })
    }
    next();
}

module.exports = isAdminUser;