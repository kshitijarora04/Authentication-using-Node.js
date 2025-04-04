// for eg this middleware checks before if the user is loggedIn before getting his profile 
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config();
// we will get req.user from this code
export const isLoggedIn = async (req, res, next) => {
    try {
        console.log(req.cookies);
        let token = req.cookies?.token || ""
        console.log("Token found:", token ? "Yes" : "No");
        if (!token) {
            console.log("No token");
            return res.status(401).json({
                success: false,
                message: "Authentication failed"
            })
        }

        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN)

        req.user = decodedToken;

        console.log(req.user);

        next();

    }
    catch (error) {
        console.log("Auth Middleware Failure");
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
};

