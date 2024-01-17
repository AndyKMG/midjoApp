const mongoose = require("mongoose")


module.exports = mongoose.models('UsersInfo', {
    id: { type: String },
    created_at: { type: String },
    updated_at: { type: String },
    email: { type: String },
    password: { type: String },
    phone: { type: String }

})
