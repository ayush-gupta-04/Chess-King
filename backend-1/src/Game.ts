import { Chess } from "chess.js";
import { UserManager } from "./UserManager";
import { OutgoingMessageToClient } from "./types/types";

export class Game{
    private gameId : number;
    private whitePlayer : string;
    private blackPlayer : string;
    private whiteName : string;
    private blackName : string;
    private startTime : Date;
    private chess : Chess;
    private messages : {from : string,message : string,time : Date}[];


    public constructor(whitePlayerId : string , blackPlayerId : string,whiteName : string,blackName : string,gameId : number) {
        this.whitePlayer = whitePlayerId;
        this.blackPlayer = blackPlayerId;
        this.startTime = new Date();
        this.gameId = gameId;
        this.chess = new Chess();
        this.whiteName = whiteName;
        this.blackName = blackName;
        this.emitInitialisedGameMessage();
        this.messages = [];
    }
    public getGameId(){
        return this.gameId;
    }
    private emitInitialisedGameMessage(){
        const message : OutgoingMessageToClient = {
            type : 'GAME_INITIALISED',
            data : {
                gameId : this.gameId
            }
        }

        UserManager.getInstance().getUser(this.whitePlayer)?.emit(JSON.stringify(message));
        UserManager.getInstance().getUser(this.blackPlayer)?.emit(JSON.stringify(message));
    }

    addMove(playerId : string,from : string,to : string) : {isDraw : boolean , winner : 'w' | 'b' | null} {
        const turn = this.chess.turn();
        if(turn == 'w' && playerId == this.blackPlayer){
            throw new Error("Invalid Move !")
        }

        if(turn == 'b' && playerId == this.whitePlayer){
            throw new Error("Invalid Move !")
        }

        this.chess.move({from : from,to : to})
        console.log(this.chess.ascii());


        const draw = this.chess.isDraw() || this.chess.isDrawByFiftyMoves();
        const gameOver = this.chess.isGameOver();
        return {
            isDraw : draw,
            winner : gameOver ? turn : null
        }

    }

    getAllPlayerPlusSpectator(){
        const EveryPeople = [this.whitePlayer,this.blackPlayer];
        return EveryPeople;
    }

    getAllPlayer(){
        const EveryPeople = [this.whitePlayer,this.blackPlayer];
        return EveryPeople;
    }


    getCurrentState(playerId : string) : {board : string , color : 'w' | 'b',history : string[]}{
        const board = this.chess.fen();
        const color = this.whitePlayer === playerId ? 'w' : 'b'
        const history = this.chess.history();
        return {
            board :board,
            color : color,
            history
        };
    }

    addMessage(from : string , message : string,time : Date){
        this.messages.push({
            from : from,
            message : message,
            time : time
        })
    }

    getMessages(){
        return this.messages;
    }


}