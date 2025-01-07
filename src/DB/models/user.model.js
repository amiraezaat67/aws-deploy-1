import { DataTypes } from "sequelize";
import { hashSync } from "bcrypt";

import { sequelizeConfig } from "../connection.js";

const userModel  = sequelizeConfig.define('tbl_users',
    {
        fname:{
            type:DataTypes.STRING,
            allowNull: false,
            validate:{
                notEmpty: true,
                len: [2,10]
            }
        },
        lname:{
            type:DataTypes.STRING,
            allowNull: false,
        },
        username:{
            type:DataTypes.VIRTUAL,
            /** getter method to get the full name based on fname and lname on time */
            get(){
                const firstName  = this.getDataValue('fname')
                const lastName = this.getDataValue('lname')
                return `${firstName} ${lastName}`
            }
        },
        email:{
            type:DataTypes.STRING,
            allowNull: false,
            unique: 'idx_email_unique',
            validate:{
                isEmail: true,

            }
        },
        password:{
            type:DataTypes.STRING,
            allowNull: false,
            /** setter method to hash the password on time */
            set(value){
                this.setDataValue('password', hashSync(value,10))
            }
        },
        role:{
            type:DataTypes.ENUM ('admin', 'user'),
            allowNull: false,
            defaultValue: 'user'
        },
        age:{
            type:DataTypes.INTEGER,
            allowNull: false,
            /** Custom validation using methods */
            validate:{
                checkAge(value){
                    if(value < 18){
                        throw new Error('Age must be greater than 18')
                    }
                }
            }
        }
    },
    {
        timestamps:true , 
        createdAt:'created_at',
        updatedAt:'updated_at',
        freezeTableName: true,
        // validate:{
        //     checkAge(value){
        //         if(!value || this.age < 18){
        //             throw new Error('Age must be greater than 18')
        //         }
        //     }
        // }
    });

export default userModel