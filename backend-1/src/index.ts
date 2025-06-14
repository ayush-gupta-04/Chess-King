import express from 'express';
import {WebSocket , WebSocketServer} from 'ws'
import { UserManager } from './UserManager';
import jwt, { JwtPayload } from "jsonwebtoken";

const app = express();
const http = app.listen(8080);
const wss = new WebSocketServer({server : http});

wss.on('connection' , (ws : WebSocket,req : Request) => {
    const token = req.url?.split('?token=')[1];
    try {
        console.log(token)
        const decoded = jwt.verify(token,process.env.JWT_SECRET! || 'secret');
        //@ts-ignore
        const userId = decoded.id as string;
        //@ts-ignore
        const name = decoded.name as string;
        if(userId && name){
            if(userId && UserManager.getInstance().getUser(userId) == null){
            console.log("Creating user : " + userId + "  " + name);
            UserManager.getInstance().addUser(userId,ws,name);
            }
            else if(userId && UserManager.getInstance().getUser(userId) != null){
                console.log("Reconnecting the user : " + userId + "  " + name)
                UserManager.getInstance().getUser(userId)?.reconnectUser(ws);
            }
        }
    } catch (error) {
        console.log(error);
    }
})