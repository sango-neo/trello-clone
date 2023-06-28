import { Request, Response, NextFunction } from "express";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";
import BoardModel from '../models/board';
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import { SocketEventsEnum } from "../types/socketEvents.enum";
import { getErrorMessage } from "../helpers";

export const getBoards = async (req: ExpressRequestInterface, res: Response, next: NextFunction) => {
    try {
        if(!req.user) {
            return res.sendStatus(401);
        }
        const boards = await BoardModel.find({userId: req.user.id});
        res.send(boards); //sends array of all the boards found in  db that match the user id
    } catch (err) {
        next(err);
    }
}

export const createBoard = async (req: ExpressRequestInterface, res: Response, next: NextFunction) => {
    try {
        if(!req.user) {
            return res.sendStatus(401);
        }
        const newBoard = new BoardModel({
            title: req.body.title,
            userId: req.user._id, //or req.body.id is fine
        }); //this only creates an instance of the board model. 
        const savedBoard = await newBoard.save(); //saving in db
        res.send(savedBoard); //sends array of all the boards found in  db that match the user id
    } catch (err) {
        next(err);
    }
}

export const getBoard = async (req: ExpressRequestInterface, res: Response, next: NextFunction) => {
    try {
        if(!req.user) {
            return res.sendStatus(401);
        }
        const board = await BoardModel.findById(req.params.boardId); //must match the slug "key" text/name on server.ts
        res.send(board);
        
    } catch (err) {
        next(err);
    }
}

export const joinBoard = (io: Server, socket: Socket, data: {boardId: string}) => {
    console.log("server socket io join", socket.user); //my check
    socket.join(data.boardId); //joining user to a board room
}

export const leaveBoard = (io: Server, socket: Socket, data: {boardId: string}) => {
    console.log("server socket io leave", data.boardId); //my check
    socket.leave(data.boardId); //removes this socket from the particular (board) room 
}

export const updateBoard = async (
    io: Server, 
    socket: Socket, 
    data: {boardId: string, fields: {title: string}}) => {

        try {
            if (!socket.user) {
            socket.emit(SocketEventsEnum.boardsUpdateFailure, 'User is not authorized'); //pass err to our helper 
            return;
            }
            
            const updatedBoard = await BoardModel.findByIdAndUpdate(data.boardId, data.fields, {new: true});
            socket.emit(SocketEventsEnum.boardsUpdateSuccess, updatedBoard); 
            io.to(data.boardId).emit(SocketEventsEnum.boardsUpdateSuccess, updatedBoard); //emit to all
        }
        catch (err) {
            socket.emit(SocketEventsEnum.boardsUpdateFailure, getErrorMessage(err)); //pass err to our helper 
        }

}

export const deleteBoard = async (
    io: Server, 
    socket: Socket, 
    data: {boardId: string}) => {

        try {
            if (!socket.user) {
            socket.emit(SocketEventsEnum.boardsDeleteFailure, 'User is not authorized'); //pass err to our helper 
            return;
            }
            
            await BoardModel.deleteOne({_id: data.boardId}); //findByIdAndDelete returns the deleted data
            io.to(data.boardId).emit(SocketEventsEnum.boardsDeleteSuccess); //emit to all
            //once board is deleted we will redirect to (boards) homepage
        }
        catch (err) {
            socket.emit(SocketEventsEnum.boardsDeleteFailure, getErrorMessage(err)); //pass err to our helper 
        }

}


