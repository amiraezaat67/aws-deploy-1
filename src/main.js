
import express from 'express'
import controllerHandler from './utils/routers-handler.js'
import {database_connection} from './DB/connection.js'


/**
 * 
 * @description - start the server
 */
const bootstrap = async () => {
    const app = express()

    app.use(express.json())

    // Handel all project controllers
    controllerHandler(app)

    database_connection()
    
    app.listen(3000, () => {
        console.log('Server running on port 3000')
    })
}


export default bootstrap    