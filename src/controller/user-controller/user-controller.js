// "All user related contoller functions are defined here...!"
import mongoose from "mongoose"
import userModal from "../../modals/user-modals/user-modals.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import fs from "fs";
import path from "path";
import multer from "multer";
import NodeCache from "node-cache";
import nodemailer from "nodemailer"
import Stripe from "stripe"


const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
    : null;


const users = [
  { userName: "Ayan", email: "ayan@example.com", password: "Ayan@123", role: "student" },
  { userName: "Hina", email: "hina@example.com", password: "Hina@456", role: "trainer" },
  { userName: "Arif", email: "arif@example.com", password: "Arif@789", role: "student" },
  { userName: "Nida", email: "nida@example.com", password: "Nida@321", role: "trainer" },
  { userName: "Saad", email: "saad@example.com", password: "Saad@654", role: "student" },
  { userName: "Mina", email: "mina@example.com", password: "Mina@987", role: "student" },
  { userName: "Adam", email: "adam@example.com", password: "Adam@111", role: "trainer" },
  { userName: "Raza", email: "raza@example.com", password: "Raza@222", role: "student" },
  { userName: "Iram", email: "iram@example.com", password: "Iram@333", role: "trainer" },
  { userName: "Zain", email: "zain@example.com", password: "Zain@444", role: "student" }
];
const cacheClient = new NodeCache();

const greetUser = (req, res) =>{
    return res.status(200).send({
        message: "User Module in Node Js"
    })
}
// "Create User"
const createUser = async (req, res)=>{
    try {
        const isUserExist = await userModal.findOne({email: req.body.email}) 
        if( isUserExist ){
            return res.status(400).send({
                status: false,
                message: "Already Email Exist"
            })
        }
        const securePass = await bcrypt.hash(req.body?.password, 10)

       
        let userData = {...req?.body, password:securePass}
        console.log("User:", userData)
        const newUser = new userModal(userData) 
        const saveUser = await newUser.save()

        if(saveUser) {
            return res.status(200).send({
                status: true,
                message: "User Saved Successfully"
            })
        }
        
    } catch (error) {
        console.log("Error While Saving User:", error)
        return res.status(500).send({
            status: false,
            message: "Internal Server Error"
        })
    }
}

// "Login Controller"

const handleLogin = async (req, res)=>{
try {
    const {email, password} = req?.body

    if(!email || !password){
        return res.status(400).send({
            status: false,
            message: "Validation Err"
        })
    }
    const isUserExist = await userModal.findOne({email: email})
    if(!isUserExist){
        return res.status(400).send({
            status: false,
            message: "User Does Not Exist"
        })
    }

    const checkPassword = await bcrypt.compare(password, isUserExist.password)
    if(!checkPassword){
        return res.status(400).send({
            status: false,
            message: "Password Didn't Match"
        })
    }

    const token = jwt.sign({
        name: isUserExist.userName,
        email: isUserExist.email,
    },
    process.env.JWT_Secret,
    {
        expiresIn: "1d"
    }
)
    return res.status(200).send({
        status: true,
        message:" You Have Logged Successfully..!",
        // data: isUserExist,
        token: token,

    })
} catch (error) {
    return res.status(500).send({
        status: false,
        message:"Error while Login User"
    })
}
}

const fetchUsers = async (req, res) =>{
    try {
        const {role} = req.query
        console.log("Role:", role)

        const counts = await userModal.countDocuments()
        console.log("Counts:", counts);

        if(counts == 0){
            return res.status(400).send({
                status: false,
                message: "No Users Found",
                data: []
            })
        }
        const query = (role) ? ({role}) : ({})
        // const fetchData = await userModal.find(query).select("userName email")
        const fetchData = await userModal.find(query).select("")

        return res.status(200).send({
            status: true,
            message: "Users",
            data: fetchData
        })

    } catch (error) {
        console.log("Error while fetching Users", error)
        return res.status(400).send({
            status: false,
            message: "Error while fetching Users"

        })
    }
}
const fetchUsersById = async (req,res)=>{
    const redisKey = req.params.uid;
    console.log("Redis Key:", redisKey)
    try {
        const cacheData = await cacheClient.get(redisKey);
        if(cacheData) {
            console.log("Fetch User from Server Memory");
            return res.status(200).send({
                status: true,
                message: "User Fetched",
                data: JSON.parse(cacheData)
            })
        }
        const fetchData = await userModal.findById(redisKey).select("-password");
       await cacheClient.set(redisKey, JSON.stringify(fetchData));
        console.log("User Fetched From DB")

        return res.status(200).send({
            status: true,
            message: "User Fetched",
            data: fetchData
        })

        
    } catch (error) {
        console.log("Error while Fetching User")
        return res.status(500).send({
            status: false,
            message: "Internal Server Error"
        })        
    }
}

const fetchSingleUsers =async (req, res) =>{
try {
    
    const {uid} = req.params;
    console.log("User Id:",uid )

    const user = await userModal.findById(uid);
    if(!user) {
        return res.status(400).send({
            status: false,
            message: "User not found",
            data: null
        })
    }
    return res.status(200).send({
        status: true,
        message: "User",
        data: user
    })

} catch (error) {
    console.log("Error While Fetching User")
    return res.status(500).send({
        status: false,
        message: "Internal Server Error"
    })
}
}

// Delete User Controller

const handleDeleteUser = async (req, res)=>{
    try {
        const {uid} = req.params
        console.log("User Id:", uid);

        const checkUid = mongoose.isValidObjectId(uid);

        if(!checkUid){
            return res.status(400).send({
                status: false,
                message: "Invalid User ID"
            })
        }

        // const deleteUser = await userModal.findByIdAndDelete(uid);

        const deleteUser = await userModal.deleteOne({_id: uid})
        if(deleteUser){
            return res.status(200).send({
                status: true,
                message: "User Deleted Successfully"
            })
        }


    } catch (error) {
        console.log(`Error While Deleting Users: ${error}`)
        return res.status(500).send({
            status: false,
            message: "Error while deleting Users"
        })
    }
}
const updateUser = async (req, res)=>{
    const {uid, updatedName, updatedPassword, updatedEmail, updatedRole} = req.body;
    try {
            const update = await userModal.findByIdAndUpdate(
                uid,        
                {
                    userName: updatedName,
                    password: updatedPassword,
                    email: updatedEmail,
                    role: updatedRole
                },
                { new: true }
            )
            console.log("Updated Name: ", updatedName)

            if(update){
                return res.status(200).send({
                    status: true,
                    message: "User Updated Successfully..!"
                })
            }
    }
    catch (error) {
        console.log(`Error While Updating Users: ${error}`)
        return res.status(500).send({
            status: false,
            message: "Error while updating Users"
        })
    }
}
const deleteAllUser =async (req, res) =>{
    
    try {
        const deleteAll = await userModal.deleteMany({})
            
                return res.status(200).send({
                    status: true,
                    message : "All Users are Deleted Successfully",
                    data : []
                })
            
            
        
        
    } catch (error) {
        console.log("Error while Deleting All Users")
        return res.status(400).send({
            status : false,
            message : "Error while Deleting All Users"
        })
    }
}
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueFileName = Date.now() + "-" + file.originalname;
        cb(null, uniqueFileName);
    }
});

const uploadMedia = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }).single('image');

const uploadMediaFile = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                status: false,
                message: "Image is Required"
            });
        }

        return res.status(200).send({
            status: true,
            message: "Image Uploaded Successfully...!"
        });
    } catch (error) {
        console.log("Error while Uploading Image:", error);
        return res.status(500).send({
            status: false,
            message: "Error while Uploading Image"
        });
    }
};
 const addBulkData = async (req, res) =>{
    try {
        const insertData = await userModal.insertMany(users)

        if(insertData){
            return res.status(200).send({
                status: true,
                message: "Bulk Users Added Successfully...!"
            })
        }
        
    } catch (error) {
        console.log(`Error while Adding Bulk Users ${error}`)
        return res.status(500).send({
            status: false,
            message : "Error while Adding Bulk Users"
        })
    }
 }
 const fetchUsersPerPage = async (req, res) =>{
    try {
        const { pageVal, limitVal } = req.query
        console.log(`Page: ${pageVal}. Limit: ${limitVal}`)

        const page = Number(pageVal) || 1;
        const limit = Number(limitVal) || 10;
        const skip = (page - 1) * limit;

        const countsData = await userModal.countDocuments();
        const fetchData = await userModal
        .find()
        .sort({ createdAt : 1})
        .skip(skip)
        .limit(limit)

        return res.status(200).send({
            status : true,
            message: "Users",
            data : {
                users: fetchData,
                count : countsData,
                page: page,
                skip: skip
            }
        })
    } catch (error) {
        console.log("Error while Fetching Users")
        return res.status(500).send({
            status : false,
            message: "Error While Fetching Users"
        })
    }
 }

 const handleSendEmail = async (req, res) =>{
    const {userEmail} = req.body;
    console.log("User Email:", userEmail)

    try {
        const randomNumber = Math.floor(Math.random()*5000) + new Date().getTime();
        const otp = String(randomNumber).slice(0, 6);
        console.log("OTP:", otp)

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user : process.env.EMAIL,
                pass : process.env.PASSWORD
            }
        })
        const receiverEmail = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: "Email Verification Process",
    html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
        </head>

        <body style="
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            font-family: Arial, Helvetica, sans-serif;
        ">

            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color: #f4f6f8; padding: 40px 15px;">

                <tr>
                    <td align="center">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0"
                            style="
                                max-width: 600px;
                                background-color: #ffffff;
                                border-radius: 10px;
                                overflow: hidden;
                                box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                            ">

                            <!-- Header -->
                            <tr>
                                <td align="center"
                                    style="
                                        background-color: #2563eb;
                                        padding: 25px;
                                    ">

                                    <h1 style="
                                        margin: 0;
                                        color: #ffffff;
                                        font-size: 24px;
                                    ">
                                        YourApp
                                    </h1>

                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 35px;">

                                    <h2 style="
                                        margin-top: 0;
                                        color: #222222;
                                        font-size: 24px;
                                    ">
                                        Verify Your Email
                                    </h2>

                                    <p style="
                                        color: #555555;
                                        font-size: 16px;
                                        line-height: 1.6;
                                    ">
                                        Hello,
                                    </p>

                                    <p style="
                                        color: #555555;
                                        font-size: 16px;
                                        line-height: 1.6;
                                    ">
                                        We received a request to verify your
                                        email address. Please use the
                                        verification code below to continue.
                                    </p>

                                    <!-- OTP -->
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" style="padding: 20px 0;">

                                                <div style="
                                                    display: inline-block;
                                                    background-color: #f1f5f9;
                                                    border: 1px solid #e2e8f0;
                                                    border-radius: 8px;
                                                    padding: 18px 35px;
                                                ">

                                                    <span style="
                                                        font-size: 32px;
                                                        font-weight: bold;
                                                        letter-spacing: 8px;
                                                        color: #2563eb;
                                                    ">
                                                        ${otp}
                                                    </span>

                                                </div>

                                            </td>
                                        </tr>
                                    </table>

                                    <p style="
                                        color: #666666;
                                        font-size: 14px;
                                        line-height: 1.6;
                                    ">
                                        This verification code will expire in
                                        <strong>5 minutes</strong>.
                                    </p>

                                    <p style="
                                        color: #666666;
                                        font-size: 14px;
                                        line-height: 1.6;
                                    ">
                                        If you did not request this code,
                                        you can safely ignore this email.
                                        Please do not share this code with anyone.
                                    </p>

                                    <p style="
                                        color: #555555;
                                        font-size: 16px;
                                        line-height: 1.6;
                                        margin-bottom: 0;
                                    ">
                                        Regards,<br>
                                        <strong>YourApp Team</strong>
                                    </p>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td align="center"
                                    style="
                                        background-color: #f8fafc;
                                        padding: 20px;
                                        border-top: 1px solid #eeeeee;
                                    ">

                                    <p style="
                                        margin: 0;
                                        color: #999999;
                                        font-size: 12px;
                                    ">
                                        © 2026 YourApp. All rights reserved.
                                    </p>

                                    <p style="
                                        margin: 8px 0 0;
                                        color: #aaaaaa;
                                        font-size: 12px;
                                    ">
                                        This is an automated email. Please do not reply.
                                    </p>

                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>

            </table>

        </body>
        </html>
    `
};
 const sendEmail = await transporter.sendMail(receiverEmail);
 if(sendEmail){
    return res.status(200).send({
        status: true,
        message: "Email Sent Successfully...!"
    })
}
    } catch (error) {
        console.log("Error While Sending Email:", error)
    } 
 }

const handleCheckOut = async (req, res) =>{
    const {items} = req.body;
    console.log("Items: ", items);

    try {
        if (!stripe) {
            return res.status(503).send({ status: false, message: "Stripe is not configured" });
        }
        const modifyData = items.map((item, index)=>{
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.productName,
                        images: [item.productImage]
                    },
                    unit_amount: Math.round(item.productPrice * 100)
                },
                quantity: item.productQuantity
            };
        })

        const paymentSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: modifyData,
            success_url: "http://localhost:3000/src/success",
            cancel_url: "http://localhost:3000/src/contact"
        })
        console.log("Payment Session: ", paymentSession);

        if(paymentSession){
            return res.status(200).send({
                status: true,
                message: "payment Successful...!",
                data : {
                    sessionId: paymentSession.id,
                    checkoutUrl: paymentSession.url
                }
            })
        }

    } catch (error) {
        console.log("Error While CheckOut:", error);
        return res.status(500).send({
            status: false,
            message: "Error While CheckOut"
        })
    }
}

export { greetUser, createUser, handleCheckOut ,addBulkData, fetchUsersPerPage, handleSendEmail,fetchUsers,fetchUsersById, handleDeleteUser, fetchSingleUsers, updateUser, deleteAllUser, handleLogin, uploadMedia, uploadMediaFile };
