import { Document, Schema } from "mongoose";

export interface Board {
    title: string;
    createdAt: Date;
    updatedAt: Date;
    userId: Schema.Types.ObjectId; //the user the board(s) are for
}

export interface BoardDocument extends Board, Document {}