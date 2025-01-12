

import  { Router} from 'express'
import * as UserServices from './Services/profile.service.js'  
import { AuthenticationMiddleware } from '../../Middleware/index.js'

const userController = Router()

userController.get('/profile',AuthenticationMiddleware, UserServices.profileService)
userController.put('/update-password',AuthenticationMiddleware, UserServices.updatePasswordService)
userController.put('/update-personal-info',AuthenticationMiddleware, UserServices.updatePersonalInfoService)
userController.delete('/delete-account',AuthenticationMiddleware, UserServices.deleteAccountService)

export   {userController}