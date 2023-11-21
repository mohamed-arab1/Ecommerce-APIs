const mongoose = require('mongoose');

const dbConnect = () => {
    try{
        const connect = mongoose.connect(process.env.MONGOOSE_URL);
        console.log('database connected successfully')
    }catch(err){
        console.log(err)
    }
}

module.exports = {
    dbConnect
}
