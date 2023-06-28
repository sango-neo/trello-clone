import { NextFunction, Response } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import ColumnModel from "../models/column";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";
import { SocketEventsEnum } from "../types/socketEvents.enum";
import { getErrorMessage } from "../helpers";
 
export const getColumns = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction,
    ) => {
        try {
            if(!req.user) {
                return res.sendStatus(401);
            }
            const columns = await ColumnModel.find({boardId: req.params.boardId }); 
            res.send(columns);
        } catch (err) {
            next(err);
        }
} 
//we need the user data in order to check if user is logged in
//the board data lets us know which columns to send 
//user >> boards >> board >> columns >> column >> tasks >> task

export const createColumn = async (io: Server, socket: Socket, data: {boardId: string, title: string}) => {
    try {
        if(!socket.user) {
            socket.emit(SocketEventsEnum.columnsCreateFailure, "User is not authorized");
            return;
        }
        const newColumn = new ColumnModel({
            title: data.title,
            boardId: data.boardId,
            userId: socket.user.id
        });
        const savedColumn = await newColumn.save();
        io.to(data.boardId).emit(SocketEventsEnum.columnsCreateSuccess, savedColumn); //io.to send to all including the sender; socket.to sends to all except the sender
        console.log("Saved Column", savedColumn);

    } catch (err) {
        socket.emit(SocketEventsEnum.columnsCreateFailure, getErrorMessage(err));
    }
};

export const deleteColumn = async (
    io: Server, 
    socket: Socket, 
    data: {boardId: string, columnId: string}) => { //want to alert all clients subscribed to the board

        try {
            if (!socket.user) {
                socket.emit(SocketEventsEnum.columnsDeleteFailure, 'User is not authorized'); //pass err to our helper 
            return;
            }
            
            await ColumnModel.deleteOne({_id: data.columnId}); //findByIdAndDelete returns the deleted data
            io.to(data.boardId).emit(SocketEventsEnum.columnsDeleteSuccess, data.columnId); //emit to all
            //once board is deleted we will redirect to (boards) homepage
        }
        catch (err) {
            socket.emit(SocketEventsEnum.columnsDeleteFailure, getErrorMessage(err)); //pass err to our helper 
        }

}

export const updateColumn = async (
    io: Server, 
    socket: Socket, 
    data: {boardId: string, columnId: string, fields: {title: string}}) => {

        try {
            if (!socket.user) {
            socket.emit(SocketEventsEnum.columnsUpdateFailure, 'User is not authorized'); //pass err to our helper 
            return;
            }
            
            const updatedColumn = await ColumnModel.findByIdAndUpdate(data.columnId, data.fields, {new: true});
            io.to(data.boardId).emit(SocketEventsEnum.columnsUpdateSuccess, updatedColumn); //emit to all
        }
        catch (err) {
            socket.emit(SocketEventsEnum.columnsUpdateFailure, getErrorMessage(err)); //pass err to our helper 
        }

}