import jwt from 'jsonwebtoken'
import {User,BlacklistToken} from '../DB/models/index.js'


export const AuthenticationMiddleware = async (req, res, next) => {
    try {
        const {token} = req.headers
        if(!token){
            return res.status(401).json({ message: 'Please login to access this route' })
        }
        
        // verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
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
    
        // get user
        const user = await User.findById(decodedToken._id,'-password -__v')
        if(!user || user.isDeleted){
            return res.status(401).json({ message: 'User not found please signup' })
        }
        req.user = user
        req.user.token = {tokenId:decodedToken.jti , expiresAt:decodedToken.exp}
        next()
    } catch (error) {
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({ message: 'This token is expired. Please login again to generate a correct token' })
        }
        console.log(error);
        res.status(500).json({ message: 'Something went wrong',error: error.message })
    }
}   
