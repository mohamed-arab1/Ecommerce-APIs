const mongoose = require("mongoose");

const validateMongoDbId = id => {
    const validId = mongoose.Types.ObjectId.isValid(id);
    if (!validId) throw new Error(`Invalid ID: ${id}`);
}

module.exports = validateMongoDbId;