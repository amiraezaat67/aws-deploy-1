

import  { Router} from 'express'
import * as UserServices from './Services/profile.service.js'  

const userController = Router()


userController.get('/profile/:id', UserServices.getUserService)
userController.get('/users', UserServices.listUsersService)
userController.put('/update/:id', UserServices.updateUserService)
userController.delete('/delete/:id', UserServices.deleteUserService)

export  default userController