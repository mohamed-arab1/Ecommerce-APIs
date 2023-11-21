const User = require('../models/users.model');
const jwt = require('jsonwebtoken');
const asyncWrapper = require('./asyncWrapper');

const authMiddleware = asyncWrapper(async (req, res, next) => {
    let token;
    if(req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(" ")[1];
        try{
            if(token){
                const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decodedToken.id)
                req.user = user
                next()
            }
        }catch(error){
            throw new Error('Not Authorized token expired, please login again')
        }
    }else{
        throw new Error("There is no token attached to header")
    }
})

const isAdmin = asyncWrapper(async (req, res, next) => {
    const { email } = req.user;
    const adminUser = await User.findOne({ email });
    if(adminUser.role !== 'admin'){
         throw new Error('You are not an admin');
    } else {
        next()
    }
})

module.exports = {
    authMiddleware,
    isAdmin
};