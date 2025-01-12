
import { DateTime } from "luxon";
import { compareSync, hashSync } from "bcrypt";
import{v4 as uuid4} from 'uuid'

import {User, BlacklistToken} from "../../../DB/models/index.js";
import { Decryption, Encryption } from "../../../utils/crypto.utils.js";
import { generateToken } from "../../../utils/tokens.utils.js";
import { EmailEvent } from "../../../Services/send-email.service.js";

export const profileService = async (req, res) => {
    try {
        const {id} = req.user 
        const data = await User.findById(id)

        data.phone = Decryption({value:data.phone, secret:process.env.ENCRYPTION_SECRET_KEY})
        
        res.status(200).json({message:'Success', data})
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' })        
    }
}

// token is added to the blacklist token table so when authentication middleware is called the token will be revoked
// for enhancement we need to add all other loggedIn devices to be revoked also to enforce user to logout from all other devices
// generate a model to store the deviceId with the userId and tokenId to be able to know all loggedIn devices for this user
// after update password, search by userId , get all tokenId , add them all to the blackListed tokens with expiration date
// also this will be used if user need to logout from all devices
export const updatePasswordService = async (req, res) => {
    try {
        const {  oldPassword , newPassword , confirmNewPassword} = req.body

        if(newPassword !== confirmNewPassword){     
            return res.status(400).json({ message:'Password and confirm password does not match' })
        }

        const user = await User.findById(req.user._id)
        if(!user){
            return res.status(404).json({ message: 'User not found' })  
        }

        const isPasswordMatch = compareSync(oldPassword, user.password)
        if(!isPasswordMatch){
            return res.status(401).json({ message: 'Invalid credentials' })
        }
        
        const hashedPassword = hashSync(newPassword, 10)
        user.password = hashedPassword
        user.passwordChangedAt = DateTime.now()
        await user.save()

        // add token to blacklist
        const {tokenId, expiresAt} = req.user.token
        await BlacklistToken.create({tokenId, expiresAt : new DateTime(expiresAt).toFormat('yyyy-MM-dd HH:mm:ss')})

        res.status(200).json({ message: 'Password updated successfully' })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' })
    }
}



export const updatePersonalInfoService = async (req, res) => {
    try {
        const {username , email , phone} = req.body 

        const user = await User.findById(req.user._id)  
        if(!user){
            return res.status(404).json({ message: 'User not found' })  
        }

        if(username) user.username = username
        if(email) {
            // find if email already exist
            const isEmailExist = await User.findOne({email})
            if(isEmailExist) return res.status(409).json({ message: 'Email already exist' })
            
            user.email = email
            user.isVerified = false

            // send confirmation email 
            const token = generateToken({
                publicClaims:{ email:user.email},
                registeredClaims: { 
                expiresIn:process.env.CONfIRM_EMAIL_EXPIRATION_TIME,
                issuer:process.env.JWT_ISSUER,
                audience:[process.env.JWT_AUDIENCE],
                jwtid:uuid4()
                },
                secretKey:process.env.JWT_SECRET_KEY_CONFIRM
            })
            const confirmationLink = `${req.protocol}://${req.headers.host}/auth/verify-email/${token}`
    
            EmailEvent.emit('sendEmail', {
                subject:'Welcome to Social App',
                text:'Please click on the link below to verify your new email',
                email:user.email,
                data:confirmationLink,
            })
        }
        if(phone) user.phone = Encryption({value:phone, secret:process.env.ENCRYPTION_SECRET_KEY})
        await user.save()
        res.status(200).json({ message: 'Personal info updated successfully' }) 
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' })
    }
}


export const deleteAccountService = async (req, res) => {
    try {
        const {_id} = req.user 
        const user = await User.findByIdAndUpdate(_id,{isDeleted:true})
        if(!user){
            return res.status(404).json({ message: 'User not found' })  
        }
        res.status(200).json({ message: 'Account deleted successfully, you ca recover your account within 30 day' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' })
    }
}