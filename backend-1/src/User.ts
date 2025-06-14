import { WebSocket } from "ws";
import { GameManager } from "./GameManager";
import { IncomingMessageFromClient, OutgoingMessageToClient } from "./types/types";
import { Game } from "./Game";
import { UserManager } from "./UserManager";

export class User{
    private id : string;
    private ws : WebSocket;
    private name : string

    public  constructor(id : string , ws : WebSocket,name : string){
        this.id = id;
        this.ws = ws;
        this.name = name;
        this.messageListener();
        this.closeListener();
    }
    public getId(){
        return this.id;
    }
    public getSocket(){
        return this.ws;
    }

    public getName(){
        return this.name;
    }

    public emit(message : string){
        this.ws.send(message);
    }
    public reconnectUser(newWs : WebSocket){
        //replace the old websocket with this new websocket.
        this.ws.removeAllListeners();
        this.ws.close();
        this.ws = newWs;

        //attach Event listeners to new Websocket.
        this.messageListener();
        this.closeListener();
    }
    private messageListener(){
        this.ws.on('message' , this.handleMessage);
    }
    private closeListener(){
        this.ws.on('close',this.handleClose);
    }
    private handleMessage = (message : string) => {
        const parsedMessage = JSON.parse(message) as IncomingMessageFromClient;
        console.log(parsedMessage);
        switch (parsedMessage.type){

            case 'INITIALISE_GAME' : 
                GameManager.getInstance().addGame(this);
                break;

            case "SEND_MESSAGE" :
                const CurrGame : Game | undefined = GameManager.getInstance().findGame(parsedMessage.data.gameId);

                //1. Store the msg in game's message state.
                //2. Send the Other PLayer message.
                if(CurrGame){
                    const players : string[] = CurrGame.getAllPlayer();
                    CurrGame.addMessage(this.name,parsedMessage.data.message,parsedMessage.data.time);
                    players.forEach((playerId) => {
                        if(playerId != this.id){
                            UserManager.getInstance().getUser(playerId)?.emit(JSON.stringify({
                                type : 'MESSAGE',
                                data : {
                                    from : this.name,
                                    message : parsedMessage.data.message,
                                    time : parsedMessage.data.time
                                }
                            }))
                        }
                    })
                }


                break;

            case "MESSAGE_SYNC" : 
                const gameData : Game | undefined = GameManager.getInstance().findGame(parsedMessage.data.gameId);
                if(gameData){
                    const allMessages = gameData.getMessages();
                    this.emit(JSON.stringify({
                        type : "MESSAGE_SYNCED",
                        data : {
                            messages : allMessages
                        }
                    }))
                    return;

                }
                break;
            case "JOIN_GAME" : 
                const CurrentGame : Game | undefined = GameManager.getInstance().findGame(parsedMessage.data.gameId);
                if(CurrentGame){
                    const gameData = CurrentGame.getCurrentState(this.id);
                    const message : OutgoingMessageToClient = {
                        type : "SYNCED_POSITION",
                        data : {
                            fen : gameData.board,
                            color : gameData.color,
                            history : gameData.history
                        }
                    }
                    this.emit(JSON.stringify(message));
                    return;
                }else{
                    const errorMessage : OutgoingMessageToClient = {
                        type : 'GAME_NOT_FOUND',
                        data : {
                            error : "Game not found!"
                        }
                    }
                    this.emit(JSON.stringify(errorMessage));
                }
                break;
            case 'ADD_MOVE' :
                const game : Game | undefined = GameManager.getInstance().findGame(parsedMessage.data.gameId);
                if(game){
                    try {
                        const response = game.addMove(this.id,parsedMessage.data.from,parsedMessage.data.to);
                        const PlayersPlusSpectator : string[] = game.getAllPlayerPlusSpectator();
                        if(response.isDraw && response.winner == null){
                            const message : OutgoingMessageToClient = {
                                type : "GAME_OVER",
                                data : {
                                    isDraw : true,
                                    winner : null
                                }
                            }
                            PlayersPlusSpectator.forEach((id) => {
                                UserManager.getInstance().getUser(id)?.emit(JSON.stringify(message));
                            });
                            return;
                        }
                        else if(!response.isDraw && response.winner != null){
                            const message : OutgoingMessageToClient = {
                                type : "GAME_OVER",
                                data : {
                                    isDraw : false,
                                    winner : response.winner
                                }
                            }
                            PlayersPlusSpectator.forEach((id) => {
                                UserManager.getInstance().getUser(id)?.emit(JSON.stringify(message));
                            });
                            return;
                        }else{
                            const message : OutgoingMessageToClient = {
                                type : "PIECE_MOVE",
                                data : {
                                    from : parsedMessage.data.from,
                                    to : parsedMessage.data.to
                                }
                            }

                            PlayersPlusSpectator.forEach((id) => {
                                if(this.id != id){
                                    UserManager.getInstance().getUser(id)?.emit(JSON.stringify(message));
                                }
                            });
                        }
                    } catch (error) {
                        console.log(error);
                        const errorMessage : OutgoingMessageToClient = {
                            type : 'INVALID_MOVE',
                            data : {
                                error : "Invalid Move !"
                            }
                        }
                        this.emit(JSON.stringify(errorMessage));
                    }
                }else{
                    const errorMessage : OutgoingMessageToClient = {
                        type : 'GAME_NOT_FOUND',
                        data : {
                            error : "Game not found!"
                        }
                    }
                    this.emit(JSON.stringify(errorMessage));
                }
        }
        
    }
    private handleClose = () => {
        console.log("User : " + this.id + " got Disconnected!");
    }
}