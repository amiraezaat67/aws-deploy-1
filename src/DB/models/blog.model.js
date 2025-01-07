import { DataTypes, Model } from "sequelize";

import { sequelizeConfig } from "../connection.js";
import userModel from "./user.model.js";


class BlogModel extends Model {
    getId(){
        return this.id
    }
}

BlogModel.init({
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        sequelize:sequelizeConfig,
        modelName: 'tbl_blogs',
        timestamps: true,
        freezeTableName: true,
        paranoid: true  // create column deletedAt
})

export default BlogModel


// one user has many blogs
userModel.hasMany(BlogModel , {foreignKey: 'fk_user_id' , onDelete:'CASCADE' , onUpdate:'CASCADE'})

// one blog belongs to one user
BlogModel.belongsTo(userModel , {foreignKey: 'fk_user_id', as:'userData' })