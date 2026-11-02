import jwt from "jsonwebtoken"

const checkAuthenticated = (req, res, next) =>{
     console.log("Headers:", req.headers);
        console.log("Authorization:", req.headers.authorization);
    try {
        const headerValue = req?.headers?.authorization;
        if(!headerValue || headerValue == undefined){
            return res.status(400).send({
                status: false,
                message: "Token is required",
            })
        }
        console.log("JWT Validation:", process.env.JWT_Secret);

        const token = headerValue.startsWith("Bearer ") ? headerValue.split(" ")[1] : headerValue;

        const verifyToken = jwt.verify(token, process.env.JWT_Secret);

        if(verifyToken){
            next();
        }
        else {
            return res.status(401).send({
                status: false,
                message: "Invalid Token or Token Expired",
            })
        }
    } catch (error) {
        console.log("Token Error:", error)
        return res.status(500).send({
            status: false,
            message: "Invalid Error from Server Side",
        })
    }
}
export default checkAuthenticated;