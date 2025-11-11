import jwt from "jsonwebtoken"
import { randomBytes } from "node:crypto";

const access_token_expires = "1h";
const refresh_token_expires = 14 * 24 * 60 * 60 * 1000; // 14 days

export default function create_token(username: string) {
    const access_token = jwt.sign({
        username: username
    }, process.env.TOKEN_SECRET ?? "", { expiresIn: access_token_expires });

    const refresh_token = randomBytes(64).toString("hex");

    return {
        access_token: access_token,
        refresh_token: refresh_token
    }
}