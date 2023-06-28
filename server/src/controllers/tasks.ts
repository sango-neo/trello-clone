import { Response, NextFunction } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import TaskModel from "../models/task";
import { SocketEventsEnum } from "../types/socketEvents.enum";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";
import { getErrorMessage } from "../helpers";


export const getTasks = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction,
    ) => {
        try {
            if(!req.user) {
                return res.sendStatus(401);
            }
            const tasks = await TaskModel.find({boardId: req.params.boardId }); 
            res.send(tasks);
        } catch (err) {
            next(err);
        }
} 

export const createTask = async (io: Server, socket: Socket, data: {boardId: string, title: string, columnId: string, descr: string}) => {
    try {
        if(!socket.user) {
            socket.emit(SocketEventsEnum.tasksCreateFailure, "User is not authorized");
            return;
        }
        const newTask = new TaskModel({
            title: data.title,
            boardId: data.boardId,
            userId: socket.user.id,
            columnId: data.columnId,

        });
        const savedTask = await newTask.save();
        io.to(data.boardId).emit(SocketEventsEnum.tasksCreateSuccess, savedTask); 
        console.log("Saved Task", savedTask);

    } catch (err) {
        socket.emit(SocketEventsEnum.tasksCreateFailure, getErrorMessage(err));
    }
}

export const updateTask = async (io: Server, socket: Socket, data: {boardId: string, taskId: string, fields: {title?: string; description?: string; columnId?: string}}) => {
    try {
        if(!socket.user) {
            socket.emit(SocketEventsEnum.tasksUpdateFailure, "User is not authorized");
        }

        const updatedTask = await TaskModel.findByIdAndUpdate(data.taskId, data.fields, {new: true});
        io.to(data.boardId).emit(SocketEventsEnum.tasksUpdateSuccess, updatedTask);

    } catch (err) {
        socket.emit(SocketEventsEnum.tasksUpdateFailure, getErrorMessage(err));
    }
}

export const deleteTask = async (
    io: Server, 
    socket: Socket, 
    data: {boardId: string, taskId: string}) => { //want to alert all clients subscribed to the board

        try {
            if (!socket.user) {
                socket.emit(SocketEventsEnum.tasksDeleteFailure, 'User is not authorized'); //pass err to our helper 
            return;
            }
            
            await TaskModel.deleteOne({_id: data.taskId}); //findByIdAndDelete returns the deleted data
            io.to(data.boardId).emit(SocketEventsEnum.tasksDeleteSuccess, data.taskId); //emit to all
            //once board is deleted we will redirect to (boards) homepage
        }
        catch (err) {
            socket.emit(SocketEventsEnum.tasksDeleteFailure, getErrorMessage(err)); //pass err to our helper 
        }

}