
import nodemailer from 'nodemailer'
import { EventEmitter } from 'node:events';

import { emailTemplate } from '../utils/email-template.utils.js';

export const sendEmailService = async({
    subject,
    message,
    to,
    cc,
    attachments=[]
}) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        const info = await transporter.sendMail({
            from:`"Email from Social APP 👻" <${process.env.USER_EMAIL}>`,
            to,
            cc,
            subject,
            html: emailTemplate({message , subject }),
            attachments
        })
       return   info
    } catch (error) {
        console.log(error);
        return error
    }
}   


export const EmailEvent = new EventEmitter();

EmailEvent.on('sendEmail', async(...args)=>{
    const {subject , text , email , cc , data , attachments=[]} = args[0]
    
    await sendEmailService({
        subject,
        message:{
            text,
            data
        },
        to:email,
        cc,
        attachments
    })
})