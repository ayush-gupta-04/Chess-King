import { Chess } from "chess.js";
import { UserManager } from "./UserManager";
import { ERROR_CODE, GameCategory, MatchType, MESSAGE, NEW_GAME, OutgoingMessage } from "./types/types";
import { User } from "./User";
import { getCode } from "./utils/getCode";

export class Game{
    private id : number;
    private w_id : string | undefined;
    private b_id : string | undefined;
    private w_name : string | undefined;
    private b_name : string | undefined;
    private w_rating : number | undefined;
    private b_rating : number | undefined;
    private chess : Chess;
    private category : GameCategory;
    private w_time : number;  //left time
    private b_time : number;  //left time
    private startedAt : number | null = null;
    private increment : number;  //in seconds
    private spectators : string[] = []; // by default the game will be public.
    public isPublic : boolean = true;
    private code : string;
    private hasStarted : boolean = false;
    private matchType : MatchType;
    private messages : MESSAGE[] = [];

    public constructor(data : NEW_GAME){
        //will initialise everything.
        this.id = data.gameData.id;
        this.w_id = data.white?.id;
        this.b_id = data.black?.id;
        this.w_name = data.white?.name;
        this.b_name = data.black?.name;
        this.w_rating = data.white?.rating;
        this.b_rating = data.black?.rating;
        this.chess = new Chess();
        this.category = data.gameData.category;
        this.isPublic = data.gameData.isPublic;
        this.code = getCode();
        this.matchType = data.gameData.matchType;
        this.hasStarted = (data.gameData.matchType == MatchType.ONLINE) || (data.gameData.matchType == MatchType.BOT) ? true : false;
        this.startedAt = this.hasStarted ? Date.now() : null;

        //setting the time thingy.
        const time : string[] = data.gameData.timeControl.split('+');
        const baseTime = parseInt(time[0])*60; // in sec
        const inc = parseInt(time[1]) // in sec.


        this.w_time = baseTime;
        this.b_time = baseTime;
        this.increment = inc;

        //broadcast game initialised info to players according to the match type.
        this.broadcastInitialisedGameMessage();
        console.log(this);
    }

    getSpectators(){
        return this.spectators;
    }

    addNewMessage(msg : MESSAGE){
        //push the msg to the messages.
        //broadcast it to white and black.
        this.messages.push(msg);
        this.broadcastMessage(msg);
    }

    getAllMessages(){
        if(!this.hasStarted){
            throw new Error(ERROR_CODE.GAME_NOT_STARTED)
        }
        return this.messages;
    }

    getCurrentState(id : string){
        if(!this.hasStarted){
            throw new Error(ERROR_CODE.GAME_NOT_STARTED)
        }
        const fen = this.chess.fen();
        const color : 'w' | 'b' | undefined = id === this.w_id ? 'w' : id === this.b_id ? 'b' : undefined ;
        return {
            fen , 
            color, 
            w_name : this.w_name , 
            w_rating : this.w_rating,
            b_name : this.b_name , 
            b_rating : this.b_rating,
            w_time : this.w_time,
            b_time : this.b_time
        }
    }
    getMovesHistory(){
        if(!this.hasStarted){
            throw new Error(ERROR_CODE.GAME_NOT_STARTED)
        }
        const history = this.chess.history();
        return history;
    }
    addSpectator(id : string){
        this.spectators.push(id);
        return;
    }

    getGameId(){
        return this.id;
    }
    
    getPlayersId(){
        return [this.w_id,this.b_id];
    }

    addOtherPlayer(id : string,name : string,rating : number , code : string){
        //add the user as other player .. if the game is not started.
        //broadcast the gamestarted msg to everyone.

        if(this.hasStarted){
            throw new Error(ERROR_CODE.GAME_ALREADY_STARTED)
        }
        if(code != this.code){
            throw new Error(ERROR_CODE.GAME_CODE_WRONG);
        }
        this.b_id = id;
        this.b_name = name;
        this.b_rating = rating;
        this.hasStarted = true;
        this.startedAt = Date.now();
        this.broadcastStartingGameMessage();
    }


    addMove(id : string,from : string,to : string){
        const turn = this.chess.turn();
        if(turn === 'w' && id === this.b_id){
            throw new Error('Invalid Move !')
        }
        if(turn === 'b' && id === this.w_id){
            throw new Error('Invalid Move !')
        }

        this.chess.move({from : from , to : to});
        console.log(this.chess.ascii());

        //if move is successfull ... we have to let everyone know the move.
        //broadcast this move to everyone.
        const everyone = [...this.getPlayersId(),...this.getSpectators()];
        console.log(everyone);
        everyone.forEach((id) => {
            UserManager.getInstance().getUser(id || '')?.emit({
                type : 'MOVE_ADDED',
                data : {
                    from : from,
                    to : to
                }
            })
        })


        //it maybe possible that the move leads to draw the match.
        //TODO : match is draw.
    }

    broadcastMessage(msg : MESSAGE){
        //broad cast the msg to every player.
        const players = this.getPlayersId();
        players.forEach(p => {

            UserManager.getInstance().getUser(p || '')?.emit({
                type : 'MESSAGE',
                data : {
                    message : msg
                }
            })

        })
    }

    broadcastStartingGameMessage(){
        const players = this.getPlayersId();
        players.forEach((id) => {
            UserManager.getInstance().getUser(id || '')?.emit({
                type : "GAME_STARTED",
                data : {
                    success : true,
                    message : "Game Started !",
                    w_name : this.w_name || '',
                    w_rating : this.w_rating || 0,
                    b_name : this.b_name || '',
                    b_rating : this.b_rating || 0
                }
            })
        })
    }

    broadcastInitialisedGameMessage(){
        const matchType = this.matchType;
        switch(matchType){
            case MatchType.ONLINE : 
                const onlineBroadcast : OutgoingMessage = {
                    type : 'GAME_INITIALISED',
                    data : {
                        gameId : this.id,
                        success : true,
                        message : "Game Initialised Successfully !",
                        w_name : this.w_name || '',
                        w_rating : this.w_rating || 0,
                        b_name : this.b_name || '',
                        b_rating : this.b_rating || 0
                    }
                }
                UserManager.getInstance().getUser(this.w_id || '')?.emit(onlineBroadcast);
                UserManager.getInstance().getUser(this.b_id || '')?.emit(onlineBroadcast);
            break;

            case MatchType.FRIEND : 
                //since white has started this game . . . we only have white data.
                //but since no match has started yet .. we will not pass any player data to the user.
                //we will send the code and gameId bs.
                const friendBroadcast : OutgoingMessage = {     
                    type : 'GAME_INITIALISED',
                    data : {
                        gameId : this.id,
                        code : this.code,
                        success : true,
                        message : "Game Initialised Successfully !",
                    }
                }
                UserManager.getInstance().getUser(this.w_id || '')?.emit(friendBroadcast);
            break;
        }
    }


}