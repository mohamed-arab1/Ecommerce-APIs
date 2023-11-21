const { Error } = require('mongoose');
const { generateToken } = require('../config/jwtToken');
const asyncWrapper = require('../middlewares/asyncWrapper');
const User = require('../models/users.model');
const validateMongoDbId = require('../utils/validateMongoDbId');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken')

// create new user
const createUser = asyncWrapper(async (req, res, next) =>{
    const email = req.body.email;
    const findEmail = await User.findOne({email: email});
    if(!findEmail){
            const user = new User(req.body);
            await user.save();
            return res.status(201).json({message: "register success"})

    }else{
        const error = new Error('user already exist')
        next(res.status(400).json({message: error.message, stack: error.stack}))
    }
})
// login
const loginUser = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;
    //check if user exist
    const findUser = await User.findOne({ email });
    const findPassword = await findUser.isPasswordMatched(password)
    if (findUser && findPassword) {
        const refreshToken = await generateRefreshToken(findUser.id);
        const updateUser = await User.findByIdAndUpdate(findUser.id, {
            refreshToken: refreshToken
        },{
            new: true,
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })
        return res.status(200).json({
            _id: findUser._id,
            firstname: findUser.firstname,
            lastname: findUser.lastname,
            email: findUser.email,
            mobile: findUser.email,
            token: generateToken(findUser._id)
        })
    } else {
        const error = new Error("Invalid credentials");
        return next(res.status(400).json({message: error.message, stack: error.stack}))
    }
})

//logout 
const logout = asyncWrapper(async(req, res) => {
    const cookie = req.cookies;
    if(!cookie.refreshToken) throw new Error('No Refresh Token in Cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if(!user){
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true
        })
       return res.sendStatus(204);
    }
    await User.findOne({refreshToken}, {
        refreshToken: "",
    },{
        new: true
    })
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true
    })
    return res.sendStatus(204);
})

//get all users 
const getUsers = asyncWrapper(async (req, res, next) => {
    try{
        const allUsers = await User.find({})
         res.status(200).json(allUsers)
    } catch(err) {
        throw new Error(err)
    }
})

// get single user 
const getSingleUser = asyncWrapper(async (req, res, next) =>{
    const { id } = req.params;
    validateMongoDbId(id)
    try{
        const singleUser = await User.findById(id, {'__v': false});
        res.status(200).json(singleUser)
    } catch(error) {
        throw new Error(error)
    }
})
// delete user
const deleteUser = asyncWrapper(async (req, res, next) =>{
    const { id } = req.params;
    validateMongoDbId(id)
    try{
        const deleteUser = await User.findByIdAndDelete(id);
        res.status(200).json({"user deleted": deleteUser})
    } catch(error) {
        throw new Error(error)
    }
});

//update user
const updateUser = asyncWrapper(async (req, res, next) => {
    const { _id } = req.user;
    validateMongoDbId(_id)
    try{
        const updateUser = await User.findByIdAndUpdate(
            _id,
            {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            mobile: req.body.mobile,
            },
            {
                new: true
            }
        )
        res.status(200).json(updateUser);
    } catch(error) {
        throw new Error(error)
    }
});

//block user
const blockUser = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try{
        const block = await User.findByIdAndUpdate(
            id,
        {
            isBlocked: true
        },
        {
            new: true
        })
        res.json({ message: "User Blocked", user: block})
    } catch(error) {
        throw new Error(error);
    }
})

//unblock user
const unblockUser = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try{
        const unblock = await User.findByIdAndUpdate(
            id,
        {
            isBlocked: false
        },
        {
            new: true
        })
        res.json({ message: "User Unblocked" , user: unblock})
    } catch(error) {
        throw new Error(error);
    }
})

//handle refresh token
const handleRefreshToken = asyncWrapper(async (req, res) => {
    const cookie = req.cookies;
    if(!cookie.refreshToken) throw new Error('No Refresh Token in Cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken: refreshToken});
    if (!user) throw new Error("Invalid Refresh Token");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if(err || user.id !== decoded.id){
            throw new Error('There is something wrong with refresh token')
        } else {
            const accessToken = generateToken(user.id);
            res.json({ accessToken })
        }
    })
})

module.exports = {
    createUser,
    loginUser,
    getUsers,
    getSingleUser,
    deleteUser,
    updateUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout
};