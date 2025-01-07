import userModel from "../../../DB/models/user.model.js"

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns  {Promise<void>} - json
 * @description - create user 
 * @url - /auth/signup {POST}
 */
export const SignUpService = async (req, res) => {
   try {
      const { firstName, lname, email, password, age } = req.body

      // check if email already exist
      const isEmailExist = await userModel.findOne({ where:{email}})      
      if(isEmailExist){
         return res.status(400).json({ message: 'User already exists' })
      }
      // create user if the email is not exist
      const data = await userModel.create({ fname:firstName, lname, email, password, age } )

      res.status(200).json({ message:'User created successfully' , data })
   } catch (error) {
      console.log(error)
      res.status(500).json({ message: error })  
   }
}