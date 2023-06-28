import { NextFunction, Request, Response } from "express";
import UserModel from "../models/user";
import { UserDocument } from "../types/user.interface";
import { Error } from "mongoose";
import jwt from "jsonwebtoken";
import { env } from "../config";
import { ExpressRequestInterface } from "../types/expressRequest.interface";

const normalizeUser = (user: UserDocument) => {
    const token = jwt.sign({id: user.id, email: user.email}, env.secret as string)
    return {
        email: user.email,
        username: user.username,
        id: user.id,
        token: `Bearer ${token}`, 
    }
}

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const newUser = new UserModel({
            email: req.body.email,
            username: req.body.email,
            password: req.body.password,
        });
        console.log("newUser", newUser);
        const savedUser = await newUser.save();
        console.log("savedUser", savedUser);
        res.send(normalizeUser(savedUser));
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            const messages = Object.values(err.errors).map((err) => err.message);
            return res.status(422).json(messages);
        }
        next(err); 
    }
}; 

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await UserModel.findOne({email: req.body.email}).select("+password");
        const errors = {emailOrPassword: "Incorrect email or password"};

        if (!user) {
            return res.status(422).json(errors); //status code: the syntax is valid, but the contents are not
        }

        const isSamePassword = await user.validatePassword(req.body.password);

        if(!isSamePassword) {
            return res.status(422).json(errors);
        }

        res.send(normalizeUser(user));
    } catch (err) {
        next(err);
    }
}

export const currentUser = async (req: ExpressRequestInterface, res: Response) => {
    if(!req.user) { //checking for the user token set in authorization header? 
        return res.sendStatus(401);
    }
    res.send(normalizeUser(req.user));
}