import { WebSocket } from "ws";
import { GameManager } from "./GameManager";
import { ERROR_CODE, IncomingMessage , MatchType, OutgoingMessage, USER_TYPE, UserDetails } from "./types/types";
import { Game } from "./Game";
import { UserManager } from "./UserManager";

export class User{
    private id : string;
    private ws : WebSocket;
    private name : string;
    private rating : number;

    public  constructor(user : UserDetails,ws : WebSocket){
        this.id = user.id;
        this.ws = ws;
        this.name = user.name;
        this.rating = user.rating;
        this.messageListener();
        this.closeListener();
    }
    public getAllInfo() : {id : string,name : string,rating : number} {
        return {
            id : this.id,
            name : this.name,
            rating : this.rating
        }
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

    public emit(message : OutgoingMessage){
        this.ws.send(JSON.stringify(message));
    }

    private messageListener(){
        this.ws.on('message' , this.handleMessage);
    }
    private closeListener(){
        this.ws.on('close',this.handleClose);
    }
    private handleClose = () => {
        console.log("User : " + this.id + " got Disconnected!");
        this.ws.removeAllListeners();
        this.ws.close();
        UserManager.getInstance().deleteUser(this.id);
    }
    public handleMessage = (message : string) => {
        const parsedMessage = JSON.parse(message) as IncomingMessage;
        switch (parsedMessage.type){
            case "INITIALISE_GAME" : 
                const matchType : MatchType = parsedMessage.data.matchType as MatchType;
                switch (matchType){
                    case MatchType.ONLINE :
                        GameManager.getInstance().addGameViaMatchingEngine(this,parsedMessage.data);
                    break;

                    case MatchType.FRIEND :
                        GameManager.getInstance().addGame(this,parsedMessage.data)
                    break;
                    //for bot let's keep it aside now.
                }

            break;

            case "SYNC_BOARD" : 
                //either this request is coming from the player or the spectator.
                //if player --> only find the game if he is really player...because this request can also be send by a spectator from page /game/:id
                //id spectator --> find the game simply...iff game is public.
                const game_id = parsedMessage.data.gameId;
                const user = parsedMessage.data.user;
                const game : Game | undefined = GameManager.getInstance().findGameByUserType(game_id,user,this.id);
                if(game != undefined){
                    //if the game was initialised but not started..
                    //we will throw an error ... that game not started. 


                    //if player -> send the fen + color.
                    //if spectator -> send the fen bs.
                    //             -> add the spwctator to the spectator[] in game.
                    try {
                        const {fen , color ,w_name,w_rating,b_name,b_rating,w_time,b_time,turn} = game.getCurrentState(this.id);
                        switch(user){
                            case USER_TYPE.PLAYER :
                                this.emit({
                                    type : 'BOARD_SYNCED',
                                    data : {
                                        fen : fen,
                                        color : color,
                                        w_name,
                                        w_rating,
                                        b_name,
                                        b_rating,
                                        w_time,
                                        b_time,
                                        turn
                                    }
                                })
                            break;

                            case USER_TYPE.SPECTATOR : 
                                console.log('spectator come')
                                if(!game.getSpectators().includes(this.id)){
                                    game.addSpectator(this.id)
                                }
                                this.emit({
                                    type : 'BOARD_SYNCED',
                                    data : {
                                        fen : fen,
                                        w_name,
                                        w_rating,
                                        b_name,
                                        b_rating,
                                        w_time,
                                        b_time,
                                        turn
                                    }
                                })
                            break;
                        }
                    } catch (error) {
                        console.log(error);
                        if(error instanceof Error){
                            //this error has occured because the game has not been started.
                            this.emit({
                                type : "ERROR",
                                data : {
                                    code : error.message as ERROR_CODE
                                }
                            })
                            return;
                        }
                    }
                }else{
                    console.log("game not found")
                    //game is not found.
                    //send the error message.
                    this.emit({
                        type : 'ERROR',
                        data : {
                            code : ERROR_CODE.GAME_NOT_FOUND,
                        }
                    })
                    return;
                }

            break;

            case 'SYNC_MESSAGE' : 
                //get all the messages and emit them.
                const game1 = GameManager.getInstance().findGame(parsedMessage.data.gameId);
                if(game1 != undefined){
                    try {
                        const allMessages = game1.getAllMessages();
                        this.emit({
                            type : 'MESSAGE_SYNCED',
                            data : {
                                messages : allMessages
                            }
                        })
                        return;
                    } catch (error) {
                        console.log(error);
                        if(error instanceof Error){
                            //this error has occured because the game has not been started.
                            this.emit({
                                type : "ERROR",
                                data : {
                                    code : error.message as ERROR_CODE
                                }
                            })
                            return;
                        }
                    }
                }
                else{
                    //game is not found.
                    //send the error message.
                    this.emit({
                        type : 'ERROR',
                        data : {
                            code : ERROR_CODE.GAME_NOT_FOUND,
                        }
                    })
                    return;
                }
            break;

            case "SEND_MESSAGE" :
                //will broadcast the message to all players.
                const currGame = GameManager.getInstance().findGame(parsedMessage.data.gameId);
                if(currGame != undefined){
                    currGame.addNewMessage({
                        from : this.name,
                        message : parsedMessage.data.message
                    })
                    return;
                }else{
                    //game is not found.
                    //send the error message.
                    this.emit({
                        type : 'ERROR',
                        data : {
                            code : ERROR_CODE.GAME_NOT_FOUND,
                        }
                    })
                    return;
                }
            break;

            case "SYNC_MOVES" :
                //send the history of the move to the user.
                const game2 = GameManager.getInstance().findGame(parsedMessage.data.gameId);
                if(game2 != undefined){
                    try {
                        const history : string[] = game2.getMovesHistory();
                        this.emit({
                            type : 'MOVES_SYNCED',
                            data : {
                                history : history
                            }
                        })
                        return;
                    } catch (error) {
                        console.log(error);
                        if(error instanceof Error){
                            //this error has occured because the game has not been started.
                            this.emit({
                                type : "ERROR",
                                data : {
                                    code : error.message as ERROR_CODE
                                }
                            })
                            return;
                        }
                    }
                }else{
                    //game is not found.
                    //send the error message.
                    this.emit({
                        type : 'ERROR',
                        data : {
                            code : ERROR_CODE.GAME_NOT_FOUND,
                        }
                    })
                    return;
                }
            break;

            case 'ADD_MOVE' : 
                const game3 = GameManager.getInstance().findGame(parsedMessage.data.gameId);
                if(game3 != undefined){
                    try {
                        game3.addMove(this.id,parsedMessage.data.from,parsedMessage.data.to);
                    } catch (error) {
                        console.log(error);
                        //TODO : should i emit this or not ?
                    }
                }else{
                    //game is not found.
                    //send the error message.
                    this.emit({
                        type : 'ERROR',
                        data : {
                            code : ERROR_CODE.GAME_NOT_FOUND,
                        }
                    })
                    return;
                }
            break;

            case "ADD_OTHER_PLAYER" : 
                const game4 = GameManager.getInstance().findGame(parsedMessage.data.gameId);
                if(game4 != undefined){
                    // add the other player to the game only if code matches.
                    try {
                        game4.addOtherPlayer(this.id,this.name,this.rating,parsedMessage.data.code);
                    } catch (error) {
                        console.log(error);
                        if(error instanceof Error){
                            //this error has occured because the game code was wrong.
                            this.emit({
                                type : "ERROR",
                                data : {
                                    code : error.message as ERROR_CODE
                                }
                            })
                            return;
                        }
                    }
                }else{
                    //game is not found.
                    //send the error message.
                    this.emit({
                        type : 'ERROR',
                        data : {
                            code : ERROR_CODE.GAME_NOT_FOUND,
                        }
                    })
                    return;
                }
            break;
        }
    }
    
}