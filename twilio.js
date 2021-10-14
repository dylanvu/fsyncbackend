import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const fromEmail = 'HackHarvardInventory@gmail.com'

export async function LogInEmail(email, name, loginLink) {
    let templateID = "SOME_PLACEHOLDER_HERE";
    const msg = {
        to: email,
        from: { name: "F•sync", email: fromEmail },
        template_Id: templateID,
        dynamic_template_data: {
            name: name,
            loginLink: loginLink
        }
    }

    console.log("Pretend this is a login email");
    // sgSendmail(sgMail, msg)
}

export async function ReturnOrder(retailerName, brandName, brandEmail) {
    let templateID = "d-8875eb84bf174244810c13ea30e22cfe";
    const msg = {
        to: brandEmail, 
        from: { name: "F•sync", email: fromEmail },
        template_Id: templateID,
        dynamic_template_data: {
            retailerName: retailerName,
            brandName: brandName
        }
    };
    
    sgSendmail(sgMail, msg);
}

export async function RequestEmail(askerName, askerEmail, targetName, targetEmail, productName, productID, typeObject) {
    // TODO: Get brand name, quantity requested
    // typeObject
        // target : "Retailers" or "Brands"
        // asker : same as above ^^^
    let templates = {
        brandToretail : "d-028d554c5f1546c3a8e39ead6ff29da8",
        retailTobrand : "d-30c950a06b8e46afaff11343f7a2b000",
        retailToretail : "d-ad88ed9189214aeda98e387371541fff"
    }

    let templateID;
    let msg;

    // Figure out which template to use
    if (typeObject.asker === "Retailers" && typeObject.target === "Brands") {
        // Retailer to brand
        templateID = templates.retailTobrand
        msg = {
            to: targetEmail,
            from: { name: "F•sync", email: 'HackHarvardInventory@gmail.com' },
            template_Id: templateID,
            dynamic_template_data: {
                retailerName: askerName,
                brandName: targetName,
            }
        }
    } else if (typeObject.asker === "Brands" && typeObject.target === "Retailers") {
        // Brand to Retailer
        templateID = templates.brandToretail;
        msg = {
            to: targetEmail,
            from: { name: "F•sync", email: 'HackHarvardInventory@gmail.com' },
            template_Id: templateID,
            dynamic_template_data: {
                retailerName: askerName,
                brandName: targetName,
            }
        }
    } else {
        // Just send retail to retail
        templateID = templates.retailToretail;
        msg = {
            to: targetEmail,
            from: { name: "F•sync", email: 'HackHarvardInventory@gmail.com' },
            template_Id: templateID,
            dynamic_template_data: {
                retailerAskname : askerName,
                retailerName: targetName,
            }
        }
    }

    sgSendmail(sgMail, msg);
}

export async function AddedByBrand(email, retailerName, brandName) {
    let templateID = "d-4ae1a1749b6b491eb46ee9d5543ccf79";

    const msg = {
        to: email, 
        from: { name: "F•sync", email: fromEmail },
        template_Id: templateID,
        dynamic_template_data: {
            retailerName: retailerName,
            brandName: brandName
        }
    };
    
    sgSendmail(sgMail, msg);
}

export async function WelcomeCompany(email, name) {
    // Use a dynamic template
    // THIS WORKS: https://medium.com/@arjunbastola/sending-emails-using-node-js-and-sendgrid-5ad4dea7cf44
    // Example usage: WelcomeRetailer("dylanvu9@gmail.com", "Dylan")
    let templateID = "d-8fc45f91db8847de9d4a00e667a149c8";

    const msg = {
        to: email, 
        from: { name: "F•sync", email: fromEmail },
        template_Id: templateID,
        dynamic_template_data: {
            retailerName: name
        }
    };
    
    sgSendmail(sgMail, msg);
}

function sgSendmail(sgMail, msg) {
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

// module.exports = { WelcomeCompany, AddedByBrand }