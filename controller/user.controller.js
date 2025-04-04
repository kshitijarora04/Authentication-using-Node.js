// in controllers we write the callbacks and the buisness logic
import User from "../model/User.model.js"
import crypto from "crypto"
import nodemailer from "nodemailer"
import bcrypt from "bcryptjs"
import dotenv from "dotenv";
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";

dotenv.config();

const registerUser = async (req, res) => {
    // get data 
    // validate
    // check if user already exists
    // create new if does not exists
    // create a verification token
    // save token in db
    // send token as email to user
    // send a success status to user

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }
    try {

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }
        const user = await User.create({
            name,
            email,
            password
        })

        if (!user) {
            return res.status(400).json({
                message: "User not registered",
            });
        }

        const token = crypto.randomBytes(32).toString("hex");
        console.log(token);
        user.verificationToken = token;
        await user.save();

        // send email   
        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: 2525,
            secure: false, // true for port 465, false for other ports
            auth: {
                user: process.env.MAILTRAP_USERNAME,
                pass: process.env.MAILTRAP_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.MAILTRAP_SENDEREMAIL, // sender address
            to: user.email, // list of receivers
            subject: "Verify Your Email", // Subject line
            text:
                `
            Please click on the following link:
            ${process.env.BASE_URL}/api/v1/users/verify/${token}   
            `,
        }

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: "User Registered Successfully",
            success: true
        })

    }

    catch (error) {
        res.status(400).json({
            message: "User not registered",
            error,
            success: false,
        });
    }
};

const verifyUser = async (req, res) => {
    // get token from url
    // validate token
    // find user based on token
    // if not
    // set isVerified field to true
    // remove verification token
    // save return response

    const { token } = req.params;

    console.log(token);

    if (!token) {
        return res.status(400).json({
            message: "Invalid Token"
        })
    }

    const user = await User.findOne({ verificationToken: token })

    if (!user) {
        return res.status(400).json({
            message: "Invalid Token or User Already registered",
        });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.status(200).json({
        message: "User verified Successfully"
    });
};

const login = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({
            message: "All Fields are required"
        })
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                message: "Invalid Email or Password"
            })
        }

        // compare between original password and hashed password
        const isMatched = await bcrypt.compare(password, user.password);
        console.log(isMatched);

        if (!isMatched) {
            return res.status(400).json({
                message: "Inavlid Email or Password"
            })
        }

        // isVerified Verification
        if (!user.isVerified) {
            return res.status(400).json({
                message: "Please verify Your email first"
            })
        }

        const token = jwt.sign({ id: user._id, role: user.role },
            process.env.JWT_TOKEN, {
            expiresIn: '24h'
        });

        const cookieOptions = {
            // httpOnly:true cookies are in control of backend
            httpOnly: true,

            // to make cookie secure
            secure: true,

            // maxAge of cookie,after that it expires
            maxAge: 24 * 60 * 60 * 1000
        }

        res.cookie("token", token, cookieOptions);
        res.status(200).
            json({
                success: true,
                message: "Login Successfull",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    role: user.role
                }
            })

    } catch (error) {
        res.status(400).json({
            message: "User not login",
            error,
            success: false,
        });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not Found",
            })
        }

        return res.status(200).json({
            success: true,
            message: "User Profile found Successfully"
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "User not Found",
            error
        })
    }
}

const logoutUser = async (req, res) => {
    try {
        res.cookie('token', '', {});
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {

    }
}

const forgotPassword = async (req, res) => {
    try {
        // get-email
        // find user based on email
        // if user found
        // reset password token + expiry-->Date.now() +10*60*1000
        // send email-->design url
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({
                success: false,
                message: "User not found",
            })
        }
        const token = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpires = (Date.now() + 10 * 60 * 1000);
        await user.save();

        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: 2525,
            secure: false, // true for port 465, false for other ports
            auth: {
                user: process.env.MAILTRAP_USERNAME,
                pass: process.env.MAILTRAP_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.MAILTRAP_SENDEREMAIL, // sender address
            to: user.email, // list of receivers
            subject: "Verify Your Email", // Subject line
            text:
                `
            Please click on the following link to reset your password:
            ${process.env.BASE_URL}/api/v1/users/reset/${token}   
            `,
        }

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: "Password Reset Successful, Please Set a new password",
            success: true
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: `Cannot Reset Password, ${error}`
        })
    }
}


const resetPassword = async (req, res) => {
    try {
        // collect token from params
        // collect password from req.body
        const { token } = req.params;

        const { newPassword } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        })

        console.log(user);

        // set password in user
        // reset password,resetexpiry=""
        // save
        // jwt token is a heavy token-->don't use jwt everywhere

        user.password = newPassword;
        user.resetPasswordToken = "";
        user.resetPasswordExpires = "";
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password Reset Successfull"
        })
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: "Password Reset Unsuccessful"
        })
    }
}


export {
    registerUser,
    verifyUser,
    login,
    getMe,
    logoutUser,
    resetPassword,
    forgotPassword
}