import Mongo_client_Component from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import create_token from "../utils/create_token";
export default async function auth(token: string, refresh_token: string) {
    return new Promise((res) => {
        jwt.verify(token, process.env.TOKEN_SECRET ?? "",
            async (err: jwt.VerifyErrors | null, decoded: any) => {
                if (err) {
                    if (err.name === "TokenExpiredError") {
                        const client = await Mongo_client_Component();
                        const collection = client.db("user").collection("sessions");
                        const _collection = client.db("user").collection("data");

                        await client.connect();
                        const decodedPayload: any = jwt.verify(token, process.env.TOKEN_SECRET ?? "", {
                            ignoreExpiration: true,
                        });
                        const result = await _collection.findOne({
                            username: decodedPayload?.username ?? "",
                        })
                        if (result === null || result === undefined) {
                            res("User not found");
                        }
                        else {
                            const new_token = create_token(decodedPayload?.username ?? "");
                            await collection.updateOne({
                                username: decodedPayload?.username ?? ""
                            }, {
                                $set: {
                                    token: new_token.refresh_token
                                }
                            })
                            const result = await _collection.findOne({
                                username: decodedPayload?.username ?? ""
                            }, {
                                projection: {
                                    password: 0,
                                    _id: 0
                                }
                            })
                            res({ ...result, access_token: new_token.access_token })

                        }

                    }
                    else {
                        res("Invalid token");
                    }
                }
                else {
                    const username = decoded?.username ?? "";

                    const client = await Mongo_client_Component();
                    const db = client.db("user");
                    const collection = db.collection('data');
                    await client.connect();
                    const result = await collection.findOne({
                        username: username
                    }, {
                        projection: {
                            password: 0,
                            _id: 0
                        }
                    })
                    if (result === null || result === undefined) {
                        res("User not found");
                    }
                    else {
                        const now = new Date().getTime();
                        if (result.expires < now) {
                            const token = randomBytes(64).toString("hex");
                            collection.updateOne({
                                username: username
                            }, {
                                $set: {
                                    token: token,
                                    expires: new Date().getTime() + 7 * 24 * 60 * 60 * 1000
                                }
                            })
                            result.token = token;
                        }
                        res(result);
                    }
                }
            });
    })
}