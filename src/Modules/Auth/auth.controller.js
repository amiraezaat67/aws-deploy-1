

import  { Router} from 'express'
import * as AuthServices from './Services/authentication.service.js'
import { AuthenticationMiddleware } from '../../Middleware/authentication.middleware.js'
import { errorHandler } from '../../utils/error-handling.utils.js'

const authRouter = Router()


authRouter.post('/signup', errorHandler(AuthServices.SignUpService))
authRouter.post('/login', AuthServices.LogInService)
authRouter.post('/logout', AuthenticationMiddleware, AuthServices.logOutService)
authRouter.get('/verify-email/:token', AuthServices.verifyEmailService)
authRouter.post('/forget-password', AuthServices.forgetPasswordService)
authRouter.post('/reset-password', AuthServices.resetPasswordService)
authRouter.post('/refresh-token', AuthServices.refreshTokenService)


export  {authRouter}