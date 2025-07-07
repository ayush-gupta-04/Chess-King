import { Chess } from "chess.js";
import { UserManager } from "./UserManager";
import { ERROR_CODE, GAME_OVER_REASON, GameCategory, MatchType, MESSAGE, NEW_GAME, OutgoingMessage } from "./types/types";
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
    private turnTimeOut : NodeJS.Timeout | null = null;
    private lastMoveAt : number | null = null;

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

        if(this.hasStarted){
            this.setTurnTimeout();
            this.lastMoveAt = Date.now();
        }

        //broadcast game initialised info to players according to the match type.
        this.broadcastInitialisedGameMessage();
    }

    setTurnTimeout(){
        const turn = this.chess.turn()
        const rem_time = turn == 'w' ? this.w_time : this.b_time;

        if(rem_time <= 0){
            this.handleTimeout(turn);
            return;
        }

        //if white's turn .. then after rem_time just do the judgement.
        this.turnTimeOut = setTimeout(() => {
            this.handleTimeout(turn);
        }, rem_time * 1000);
    }

    handleTimeout(turn : 'w' | 'b'){
        if(this.turnTimeOut){
            clearInterval(this.turnTimeOut);
        }
        const looser = turn;
        const winner = turn == 'w' ? 'b' : 'w';
        //broadcast the winner looser message. 
        this.broadcastGameOver(GAME_OVER_REASON.TIMEOUT,winner,looser);
        //TODO : 
        // calculate the rating thing.
        // end the game.
        // remove the game from engine. DB m store rhega ye sb data.
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
        const turn = this.chess.turn();
        let w_e = 0;
        let b_e = 0;
        if(turn == 'w'){
            w_e = Math.floor((Date.now() - this.lastMoveAt!)/1000);
        }else{
            b_e = Math.floor((Date.now() - this.lastMoveAt!)/1000);
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
            w_time : this.w_time - w_e,
            b_time : this.b_time - b_e,
            turn : turn
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
        this.setTurnTimeout();
        this.lastMoveAt = Date.now();
    }


    addMove(id : string,from : string,to : string){
        const turn = this.chess.turn();
        if(turn === 'w' && id === this.b_id){
            throw new Error('Invalid Move !')
        }
        if(turn === 'b' && id === this.w_id){
            throw new Error('Invalid Move !')
        }


        const now = Date.now();
        const elapsed = Math.floor((now - this.lastMoveAt!)/1000);
        

        this.chess.move({from : from , to : to});


        //reduce the w-time and b-time and add increment..since a move is made.
        if(turn == 'w'){
            this.w_time = this.w_time - elapsed;
            this.w_time = this.w_time + this.increment;
        }else{
            this.b_time = this.b_time - elapsed;
            this.b_time = this.b_time + this.increment;
        }

        //if turn white ka tha and white move chl diya to .. white ka clock clear ho jana chahiye right.
        this.lastMoveAt = now;
        if(this.turnTimeOut){
            clearInterval(this.turnTimeOut);
        }
        //if turn w ka tha and w move chl diya .. to abhi setTurnTimeout black ke lie chlna chanhiye.
        this.setTurnTimeout();

        //if move is successfull ... we have to let everyone know the move.
        //broadcast this move to everyone.
        this.broacastMoveAdded(from ,to);
        console.log(this.w_time);
        console.log(this.b_time);

        //it maybe possible that the move leads to draw the match.
        if(this.chess.isDraw() || this.chess.isDrawByFiftyMoves() || this.chess.isStalemate()){
            //if w moved and now it's b's turn next ... draw..
            this.broadcastGameOver(GAME_OVER_REASON.DRAW);
            //TODO : 
            // calculate the rating thing.
            // end the game.
            // remove the game from engine. DB m store rhega ye sb data.
        }

        if(this.chess.isCheckmate()){
            //if w moved and now it's b's turn next ... winner w....therefore winner turn.
            const winner = turn;
            const looser = turn == 'w' ? 'b' : 'w';
            this.broadcastGameOver(GAME_OVER_REASON.CHECKMATE,winner,looser);
            //TODO : 
            // calculate the rating thing.
            // end the game.
            // remove the game from engine. DB m store rhega ye sb data.
        }
    }

    broadcastGameOver(reason : GAME_OVER_REASON,winner? : 'w'|'b' , looser? : 'w' | 'b'){
        const everyone = [...this.getPlayersId(),...this.getSpectators()];
        console.log(everyone);
        everyone.forEach((id) => {
            UserManager.getInstance().getUser(id || '')?.emit({
                type : 'GAME_OVER',
                data : {
                    reason : reason,
                    w : winner,
                    l : looser,
                }
            })
        })
    }

    broacastMoveAdded(from : string ,to : string){
        const everyone = [...this.getPlayersId(),...this.getSpectators()];
        console.log(everyone);
        everyone.forEach((id) => {
            UserManager.getInstance().getUser(id || '')?.emit({
                type : 'MOVE_ADDED',
                data : {
                    from : from,
                    to : to,
                    w_t : this.w_time,
                    b_t : this.b_time,
                    turn : this.chess.turn()
                }
            })
        })
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