import { NextFunction, Response } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import jwt from "jsonwebtoken";
import { env } from "../config";
import UserModel from "../models/user";

export default async (req: ExpressRequestInterface, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.sendStatus(401);
        }
        const token = authHeader.split(" ")[1];
        const data = jwt.verify(token, env.secret as string) as {id: string; email: string;}; //we use type assertion here. we "know" the interface of the data
        const user = await UserModel.findById(data.id);

        if(!user) {
            return res.sendStatus(401); 
        }

        req.user = user;
        next(); //middlewares always call next() when done
    } catch (err) {
        res.sendStatus(401);
    }
}

// is it wise to run this verification every time if on a large scale?