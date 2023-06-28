import express, { json, urlencoded } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Socket } from "./types/socket.interface";
import mongoose  from "mongoose";
import * as usersController from "./controllers/users";
import * as boardsController from "./controllers/boards";
import * as columnsController from "./controllers/columns";
import * as tasksController from "./controllers/tasks";
import bodyParser from "body-parser";
import authMiddleware from "./middleware/auth";
import cors from "cors";
import { SocketEventsEnum } from "./types/socketEvents.enum";
import jwt from "jsonwebtoken";
import User from "./models/user";
import { secret } from "./config";

const app = express(); //creates an instance of express //returns object that defines the app (methods and properties)
const httpServer = createServer(app); //accepts requestListener function on instantiation 
const io = new Server(httpServer, { 
    cors: {
        origin: "*", //cross-origin resource sharing //accept from * origins
    },
}); //set-up a websocket server via soocket.io library

// app.use() express functionality for handling middleware functions
app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
app.use(json())
app.use(urlencoded({ extended: true })) //json() and urlencoded work on the req side of the server call


mongoose.set("toJSON", { //use .set() to configure global settings for mongoose
    virtuals: true, //virtual properties should be included when converting documents to JSON
    transform: (_, converted) => {
        delete converted._id; //res data object to client has id and _id property
    },
}); //removing the _ in the JSON responses we get from mongodb; mongoose will still have _id (and id) though

app.get("/", (req, res) => {
    res.send("API is UP");
});

app.post('/api/users', usersController.register);
app.post('/api/users/login', usersController.login);
app.get('/api/user', authMiddleware, usersController.currentUser);
app.get('/api/boards', authMiddleware, boardsController.getBoards);
app.get('/api/boards/:boardId', authMiddleware, boardsController.getBoard);
app.post('/api/boards', authMiddleware, boardsController.createBoard);
app.get('/api/boards/:boardId/columns', authMiddleware, columnsController.getColumns);
app.get('/api/boards/:boardId/tasks', authMiddleware, tasksController.getTasks);

io.use(async (socket: Socket, next) => { //use will take middleware to auth the user;
    try {
        const token = (socket.handshake.auth.token as string) ?? "";
        const data = jwt.verify(token.split(" ")[1], secret) as {
            id: string;
            email: string;
        };
        const user = await User.findById(data.id);

        if (!user) {
            return next(new Error("Authentication error"));
        }
        socket.user = user;
        next();
    } catch (err) {
        next(new Error("Authentication error"));
    }
}).on("connection", (socket) => {
    console.log("connected io");
    socket.on(SocketEventsEnum.boardsJoin, (data) => {
        boardsController.joinBoard(io, socket, data);
    });
    socket.on(SocketEventsEnum.boardsLeave, (data) => {
        boardsController.leaveBoard(io, socket, data);
    });
    socket.on(SocketEventsEnum.columnsCreate, (data) => {
        columnsController.createColumn(io, socket, data);
    });
    socket.on(SocketEventsEnum.tasksCreate, (data) => {
        tasksController.createTask(io, socket, data);
    });
    socket.on(SocketEventsEnum.tasksUpdate, (data) => {
        tasksController.updateTask(io, socket, data);
    });
    socket.on(SocketEventsEnum.tasksDelete, (data) => {
        tasksController.deleteTask(io, socket, data);
    });
    socket.on(SocketEventsEnum.boardsUpdate, (data) => {
        boardsController.updateBoard(io, socket, data);
    });
    socket.on(SocketEventsEnum.boardsDelete, (data) => {
        boardsController.deleteBoard(io, socket, data);
    });
    socket.on(SocketEventsEnum.columnsDelete, (data) => {
        columnsController.deleteColumn(io, socket, data);
    });
    socket.on(SocketEventsEnum.columnsUpdate, (data) => {
        columnsController.updateColumn(io, socket, data);
    });
    
});

mongoose.connect("mongodb://localhost:27017/eltrello", {
    family: 4 //ipv4? alternatively run "mongod --ipv6" 
}).then( () => {
    console.log("connected to mongodb");
    //only start the server after connection to database is established;
    httpServer.listen(4001, () => {
        console.log("API is listening on port 4001");
    });
}).catch( (err) => {
    console.log('failed to connect to database: ', err)
});

