import { Document, Schema } from "mongoose";

export interface Task {
    title: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    userId: Schema.Types.ObjectId; //the user the board(s) are for
    boardId: Schema.Types.ObjectId; //the board the column is for
    columnId: Schema.Types.ObjectId; 
}

export interface TaskDocument extends Task, Document {}