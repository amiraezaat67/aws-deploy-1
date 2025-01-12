import {User, BlacklistToken} from "../../../DB/models/index.js";
import { Encryption } from "../../../utils/crypto.utils.js";
import { EmailEvent } from "../../../Services/send-email.service.js";

import { v4 as uuid4 } from 'uuid'
import path from 'path'
import { compareSync, hashSync } from "bcrypt";
import { DateTime } from "luxon";
import { generateToken, verifyToken } from "../../../utils/tokens.utils.js";


export const SignUpService = async(req, res,next) => {
      const {username, email , password , confirmPassword , phone}= req.body

      if(password !== confirmPassword){
        return res.status(400).json({ message:'Password and confirm password does not match' })
      }

      const isEmailExist = await User.findOne({email})
      if(isEmailExist){
         // return res.status(409).json({ message: 'Email already exist' })
         return next(new Error('Email already exist', {cause:409}))
      }

      // encrypt phone number
      const phoneEncrypted = Encryption({value:phone, secret:process.env.ENCRYPTION_SECRET_KEY})
      console.log('phoneEncrypted', phoneEncrypted);

      // hash password
      const hashedPassword = hashSync(password, 10)
      console.log('hashedPassword', hashedPassword);

      const userObject = {
         username,
         email,
         password:hashedPassword,
         phone: phoneEncrypted,
         shareLink: username
      }

      const user = await User.create(userObject)
      // send email
      const token = generateToken({
         publicClaims:{ email},
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
         text:'Thank you for registering with us please verify your email by clicking on the link below',
         email:user.email,
         data:confirmationLink,
         cc:'amiraezaat.route@gmail.com',
         attachments:[
            {
               filename: '1_Sprint-Delivery-Process-1.webp',
               path: path.resolve('Assets/1_Sprint-Delivery-Process-1.webp'),
            },{
               filename: 'Ubuntu Server CLI cheat sheet 2024 v6.pdf',
               path: path.resolve('Assets/Ubuntu Server CLI cheat sheet 2024 v6.pdf'),
            }
         ]
      })
      res.status(201).json({ message: 'User created successfully please verify your email to activate your account', user })
}

export const verifyEmailService = async(req, res) => {
   try { 
      const {token} = req.params
      const decodedToken = verifyToken({token, secretKey:process.env.JWT_SECRET_KEY_CONFIRM})
      if(!decodedToken){
         return res.status(400).json({ message: 'Invalid token provided' })
      }

      const user = await User.findOneAndUpdate({email:decodedToken.email},{isVerified:true}, {new:true})
      if(!user){
         return res.status(404).json({ message: 'User not found' })        
      }
      res.status(200).json({ message: 'Email verified successfully' })
   } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Something went wrong',error: error.message })     
   }
}

export const LogInService = async(req, res) => {
   try {
      const {email , password} = req.body

      const user = await User.findOne({email})
      if(!user){
         return res.status(404).json({ message: 'Invalid credentials' })
      }

      const isPasswordMatch = compareSync(password, user.password)
      if(!isPasswordMatch){
         return res.status(401).json({ message: 'Invalid credentials' })
      }

      // generate token and send it to user

      const accessToken = generateToken({
         publicClaims:{ _id:user._id, email:user.email},
         registeredClaims: {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRATION_TIME,
            issuer:process.env.JWT_ISSUER,
            audience:[process.env.JWT_AUDIENCE],
            jwtid:uuid4()
         },
         secretKey:process.env.JWT_SECRET_KEY, 

      })
      const refreshToken = generateToken({
         publicClaims:{ _id:user._id, email:user.email},
         registeredClaims: {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRATION_TIME,
            issuer:process.env.JWT_ISSUER,
            audience:[process.env.JWT_AUDIENCE],
            jwtid:uuid4()
         },
         secretKey:process.env.JWT_SECRET_KEY_REFRESH
      })
      const tokens = { accessToken , refreshToken }

      res.status(200).json({ message: 'User logged in successfully', tokens })
   } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Something went wrong',error: error.message })     
   }
}

export const logOutService = async(req, res) => {
   try {

      const refreshToken = req.headers.refreshtoken
      const {tokenId, expiresAt} = req.user.token

      const decodeRefreshToken = verifyToken({token:refreshToken, secretKey:process.env.JWT_SECRET_KEY_REFRESH})

      const tokens = [{
         tokenId,
         expiresAt:new DateTime(expiresAt)
      },
      {
         tokenId:decodeRefreshToken.jti,
         expiresAt:new DateTime(decodeRefreshToken.exp)
      }]
      // add token to blacklist
      // we store the expiration date of the token to be able to know when the token expires to delete it from out database without any interference
      await BlacklistToken.insertMany(tokens)

      res.status(200).json({ message: 'User logged out successfully' })
   } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Something went wrong',error: error.message })
   }
}

export const forgetPasswordService = async(req, res) => {
   try {
      const { email }   = req.body

      const otp = Math.floor(Math.random() * 1000000)

      const user = await User.updateOne({email},{otp})
      if(!user){
         return res.status(404).json({ message: 'User not found' })
      }

      //send email
      EmailEvent.emit('sendEmail', {
         subject:'Forget Password',
         text:`Your OTP is ${otp}`,
         email,
      })

      res.status(200).json({ message: 'OTP sent successfully' })
      
   } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Something went wrong',error: error.message })
   }
}

export const resetPasswordService = async(req, res) => {
   try {
      const {email , otp , password , confirmPassword} = req.body

      if(password !== confirmPassword){
         return res.status(400).json({ message:'Password and confirm password does not match' })
      }  

      const user = await User.findOne({email})
      if(!user){
         return res.status(404).json({ message: 'User not found' })  
      }

      if(user.otp !== otp){
         return res.status(400).json({ message: 'Invalid OTP' })
      }

      const hashedPassword = hashSync(password, 10)   
         
      await User.updateOne({email},{password:hashedPassword , $unset:{otp:''}})  

      res.status(200).json({ message: 'Password reset successfully' })
   } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Something went wrong',error: error.message })
   }
}


export const refreshTokenService = async(req, res) => {
   try {
      const {refreshToken} = req.body
      const decodedToken = verifyToken({token:refreshToken, secretKey:process.env.JWT_SECRET_KEY_REFRESH})
      if(!decodedToken){
         return res.status(400).json({ message: 'Invalid token provided' })
      }
      // check if token is blacklisted
      const isTokenBlacklisted = await BlacklistToken.findOne({tokenId:decodedToken.jti})
      if(isTokenBlacklisted){
         return res.status(401).json({ message: 'This token is expired. Please login again to generate a correct token' })
      }

      // check the issuer and audience
      if(decodedToken.iss !== process.env.JWT_ISSUER || !decodedToken.aud.includes(process.env.JWT_AUDIENCE)){
         return res.status(401).json({ message: 'Invalid token payload' })
      }

      const accessToken = generateToken({
         publicClaims:{ _id:decodedToken._id, email:decodedToken.email},
         registeredClaims: {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRATION_TIME,
            issuer:process.env.JWT_ISSUER,
            audience:[process.env.JWT_AUDIENCE],
            jwtid:uuid4()
         },
         secretKey:process.env.JWT_SECRET_KEY
      })

      res.status(200).json({ message: 'Token refreshed successfully', accessToken })
   } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Something went wrong',error: error.message })
   }
}