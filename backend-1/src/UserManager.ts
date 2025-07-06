import { UserDetails } from "./types/types";
import { User } from "./User";
import { WebSocket } from "ws";
export class UserManager{
    private static instance : UserManager;
    private users : Map<string,User> ;

    private constructor(){
        this.users = new Map();
    }

    public static getInstance(){
        if(!this.instance){
            return this.instance = new UserManager();
        }
        return this.instance;
    }

    addUser(ws : WebSocket , user : UserDetails){
        console.log("creating user : " + user.id);
        const newUser = new User(user,ws);
        this.users.set(user.id , newUser);
    }
    deleteUser(userId : string){
        console.log("deleting user " + userId);
        this.users.delete(userId);
    }
    getUser(userId : string | null) : User | undefined{
        if(userId){
            return this.users.get(userId)
        }
        
    }
}