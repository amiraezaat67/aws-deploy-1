
import authRouter from '../Modules/Auth/auth.controller.js'
import blogRouter from '../Modules/Blog/blog.controller.js'
import userRouter from '../Modules/User/user.controller.js'


/**
 * 
 * @param {*} app
 * @description - handel all project controllers 
 */
const controllerHandler = (app) =>{

    app.use('/auth', authRouter)
    app.use('/blog', blogRouter)
    app.use('/user', userRouter)


    app.get('/', (req, res) => res.status(200).json({ message: 'Welcome to the Blog API' }))
    app.all('*', 
        (req, res) => res.status(404).json(
            { message: 'Route not found please make sure from your url and your method' }
        )
    )
}

export default controllerHandler