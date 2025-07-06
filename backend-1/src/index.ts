import express from 'express';
import {WebSocket , WebSocketServer} from 'ws'
import { UserManager } from './UserManager';
import jwt, { JwtPayload } from "jsonwebtoken";
import { getUser } from './utils/getUser';
import { UserDetails } from './types/types';

const app = express();
const http = app.listen(8080 , () => {console.log("Server avtive at port 8080!")});
const wss = new WebSocketServer({server : http});


wss.on('connection' , (ws : WebSocket,req : Request) => {
    const BufferedMessages : string[] = [];
    let initialised = false;
    const id = req.url?.split('?id=')[1];
    if(id){
        getUser(id).then((data : UserDetails) => {
            initialised = true;
            UserManager.getInstance().addUser(ws,data);
            BufferedMessages.forEach((msg) => {
                UserManager.getInstance().getUser(id)?.handleMessage(msg);
            })
            BufferedMessages.splice(0,BufferedMessages.length);
        });
    }
    if(!initialised){
        ws.on('message' , (msg : string) => {
            BufferedMessages.push(msg);
        })
    }
    
    
})