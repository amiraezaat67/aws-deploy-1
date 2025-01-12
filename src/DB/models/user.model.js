import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: [true,'username is required'],
        length: [20,'username must be less than 20 characters'],
        lowercase: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: 'idx_email_unique',
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    shareLink: {
        type: String,
        set: (value) => `http://localhost:3000/user/${value}`,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp:String,
    profileImage:String,
    passwordChangedAt:String
},{
    timestamps: true
})

const User = mongoose.models.User || mongoose.model('User',userSchema)

export {User}