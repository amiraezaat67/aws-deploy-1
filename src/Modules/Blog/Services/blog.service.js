import BlogModel from "../../../DB/models/blog.model.js";
import userModel from "../../../DB/models/user.model.js";

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns  {Promise<void>} - json
 * @description - create blog 
 * @url - /blog/add {POST}
 */
export const addBlogService = async (req, res) => {
    try {
        const { title, content , fk_user_id } = req.body
        const data = await BlogModel.create({ title, content , fk_user_id })
        res.status(200).json({ message:'Blog created successfully' , data })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error })  
    }
}


/**
 * 
 * @param {*} req
 * @param {*} res
 * @returns  {Promise<void>} - json
 * @description - get all blogs
 * @url - /blog/list {GET}
 */
export const listBlogsService = async (req, res) => {
    try {
        const data = await BlogModel.findAll({
            // where:{fk_user_id:5},
            include:[
                {
                    model:userModel,
                    as:'userData',
                    attributes:['fname','lname']
                }
            ],
            attributes:{exclude:['id' , 'createdAt' , 'updatedAt']},
            // limit:1,
            // offset:2,
            order:[['createdAt','ASC']],
            // paranoid:false
        })
        res.status(200).json({ message:'Blogs found successfully' , data })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error })  
    }
}



/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns  {Promise<void>} - json
 * @description - delete blog by id
 * @url - /blog/delete/:id {DELETE}
 */
export const destroyBlogService = async (req, res) => {
    try {
        const { id } = req.params
        const data = await BlogModel.destroy({where:{id}})
        res.status(200).json({ message:'Blog deleted successfully' , data })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error })  
    }
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns  {Promise<void>} - json
 * @description - restore blog by id
 * @url - /blog/restore/:id {PUT}
 */
export const restoreBlogService = async (req, res) => {
    try {
        const { id } = req.params
        const data = await BlogModel.restore({where:{id}})
        res.status(200).json({ message:'Blog restored successfully' , data })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error })  
    }
}