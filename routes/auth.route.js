const express = require('express');
const {
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
} = require('../controller/users.controller');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUser);
router.get('/refresh', handleRefreshToken);
router.get('/logout', logout)
router.get('/all-users', getUsers);
router.get('/:id', authMiddleware, isAdmin, getSingleUser);
router.delete('/:id', deleteUser);
router.put('/edit-user',authMiddleware, updateUser);
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser)
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser);


module.exports = router;