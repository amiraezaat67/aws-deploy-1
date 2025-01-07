

import  { Router} from 'express'
import * as AuthServices from './Services/registration.service.js'

const authRouter = Router()

authRouter.post('/signup', AuthServices.SignUpService)

export  default authRouter