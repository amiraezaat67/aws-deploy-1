
import { Sequelize } from "sequelize";

export const sequelizeConfig = new Sequelize('blog_project_dev', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: (msg) => console.log('Database query is: ' + msg),
})

export const database_connection = async ()=>{
  try {
      await sequelizeConfig.sync({alter:true, force:false});
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
}
