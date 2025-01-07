import { Op } from "sequelize"
import userModel from "../../../DB/models/user.model.js"

/**
 * Finders Methods 
 * findAll - return [{},{}] or empty array
 * findAndCountAll - return [{},{}] or empty array n rows array and the count of rows
 * 
 * findByPk - return {} or null
 * findOne - return {} or null
 * 
 * Create Methods
 * create - return {}
 * save - return {}
 * findOrCreate - return [{},boolean]
 * 
 * Update Methods
 * update - return [number]
 * 
 * Delete Methods
 * destroy - return number
 * 
 * Restore Methods
 * restore - return number
 */



/**
 * @param {*} req 
 * @param {*} res
 * @returns {Promise<void>} - json
 * @description - get user by id
 * @url - /user/profile/:id {GET}
 */
export const getUserService = async (req, res) => {
    try {
       const { id } = req.params
       const data = await userModel.findByPk(id)
       res.status(200).json({ message:'User found successfully' , data })
    } catch (error) {
       console.log(error)
       res.status(500).json({ message: error })  
    }
 }

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns {Promise<void>} - json
 * @description - get all users whose age is greater than or equal to the age provided
 * @url - /user/users {GET}
 */
export const listUsersService = async (req, res) => {
    try {
       const data = await userModel.findAll({
        where:{
            age:{
                [Op.gte]:req.query.age
            }
        }
       })
       res.status(200).json({ message:'Users found successfully' , data })
    } catch (error) {
       console.log(error)
       res.status(500).json({ message: error })  
    }
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns  {Promise<void>} - json
 * @description - update user by id
 * @url - /user/update/:id {PUT}
 */
export const updateUserService = async (req, res) => {
    try {
        const  {id} = req.params
        const { fname, lname, email, age } = req.body

        const data  = await userModel.update({ fname, lname, email, age },{where:{id}})

        if(data[0]){
           return res.status(200).json({ message:'User updated successfully' , data })
        }

        res.status(400).json({ message:'User not found' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error })  
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns  {Promise<void>} - json
 * @description - delete user by id
 * @url - /user/delete/:id {DELETE}
 */
export const deleteUserService = async (req, res) => {
    try {
        const  {id} = req.params
        // const data  = await userModel.destroy({truncate:true})
        const data  = await userModel.destroy({where:{id}})
        if(data){
           return res.status(200).json({ message:'User deleted successfully' , data })
        }
        res.status(400).json({ message:'User not found' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error })  
    }
}