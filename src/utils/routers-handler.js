
import * as controllers from  '../Modules/index.js'
import {globalErrorHandler} from '../Middleware/index.js'
/**
 * 
 * @param {*} app
 * @description - handel all project controllers 
 */
const controllerHandler = (app) =>{
    
    app.use('/auth', controllers.authRouter)
    app.use('/messages', controllers.messageController )
    app.use('/user', controllers.userController)
    
    app.get('/', (req, res) => res.status(200).json({ message: 'Welcome to the Blog API' }))
    
    app.all('*', 
        (req, res) => res.status(404).json(
            { message: 'Route not found please make sure from your url and your method' }
        )
    )


    app.use(globalErrorHandler)
}

export default controllerHandler