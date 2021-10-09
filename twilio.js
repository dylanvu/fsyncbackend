import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

async function AddedByBrand(email, retailerName, brandName) {
    let templateID = "d-4ae1a1749b6b491eb46ee9d5543ccf79";

    const msg = {
        to: email, 
        from: { name: "F•sync", email: 'HackHarvardInventory@gmail.com' },
        template_Id: templateID,
        dynamic_template_data: {
            retailerName: retailerName,
            brandName: brandName
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

async function WelcomeCompany(email, name) {
    // Use a dynamic template
    // THIS WORKS: https://medium.com/@arjunbastola/sending-emails-using-node-js-and-sendgrid-5ad4dea7cf44
    // Example usage: WelcomeRetailer("dylanvu9@gmail.com", "Dylan")
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

module.exports = { WelcomeCompany, AddedByBrand }