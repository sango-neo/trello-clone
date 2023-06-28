import { Document, Schema } from "mongoose";

export interface Column {
    title: string;
    createdAt: Date;
    updatedAt: Date;
    userId: Schema.Types.ObjectId; //the user the board(s) are for
    boardId: Schema.Types.ObjectId; //the board the column is for
}

export interface ColumnDocument extends Column, Document {}