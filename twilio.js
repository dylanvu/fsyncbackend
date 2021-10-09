import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'
import Axios from 'axios'
import request from 'request'
import http from "https"

dotenv.config();

async function WelcomeRetailer(email, name) {
    // https://medium.com/@arjunbastola/sending-emails-using-node-js-and-sendgrid-5ad4dea7cf44
    // Example usage: WelcomeRetailer("dylanvu9@gmail.com", "Dylan")
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    let templateID = "d-8fc45f91db8847de9d4a00e667a149c8";

    const msg = {
        to: email, 
        from: { name: "F•sync", email: 'HackHarvardInventory@gmail.com' },
        template_Id: templateID,
        dynamic_template_data: {
            retailerName: name
        }
    };
    
    sgMail.send(msg)
        .then(() => {
            console.log('Email sent')
            console.log('mail-sent-successfully', {templateId, dynamic_template_data });
            console.log('response', response);
        })
        .catch((error) => {
            console.error('send-grid-error: ', error.toString());
        });
}