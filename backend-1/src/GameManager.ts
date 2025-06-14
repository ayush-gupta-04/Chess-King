import { Game } from "./Game";
import { User } from "./User";

export class GameManager{
    private static instance : GameManager;
    private games : Game[];
    private static lastGameId : number = 0;
    private pendingPlayer : User | null;

    private constructor(){
        this.games = [];
        this.pendingPlayer = null;
    }

    public getLastGameId(){
        return GameManager.lastGameId;
    }
    public static getInstance(){
        if(!this.instance){
            return this.instance = new GameManager();
        }
        return this.instance;
    }

    addGame(user : User){
        if(this.pendingPlayer == null){
            console.log('No player available');
            console.log("Creating pending player : " + user.getId())
            this.pendingPlayer = user;
            return;
        }
        if(this.pendingPlayer.getId() === user.getId()){
            return;
        }
        GameManager.lastGameId++;
        console.log("Creating a new Game"); 
        const gameId = GameManager.lastGameId;
        const game = new Game(this.pendingPlayer.getId(),user.getId(),this.pendingPlayer.getName(),user.getName(),gameId);
        this.games.push(game);
        console.log("Created a game : " + gameId);
        console.log('white : ' + this.pendingPlayer.getName());
        console.log('black : ' + user.getName());
        this.pendingPlayer = null;
    }

    findGame(gameId : number) : Game | undefined{
        const game : Game | undefined = this.games.find(game => gameId === game.getGameId());
        return game;
    }

    removeGame(){

    }
}