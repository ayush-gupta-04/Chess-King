import type { MessageFromWebSocketServer, MessageToWebSocketServer } from "./types/types";

const WEBSOCKET_URL = 'ws://localhost:8080'
export class SignalingManager{
    private ws : WebSocket;
    private static instance : SignalingManager;
    private bufferedMessages : any[];
    private callbacks : {[key : string] : [
        {callback : (data : any) => void,id : string}
    ]} = {};
    private initialised : boolean = false;


    private constructor(token : string){
        this.ws = new WebSocket(WEBSOCKET_URL+'?token=' + token);
        this.bufferedMessages = [];
        this.initialiseEmmision();
    }

    public static getInstance(id : string){
        if(!SignalingManager.instance){
            SignalingManager.instance = new SignalingManager(id)
        }
        return SignalingManager.instance;
    }

    private initialiseEmmision(){
        this.ws.onopen = () => {
            this.initialised = true;
            this.bufferedMessages.forEach(message => {
                this.ws.send(JSON.stringify(message));
            });
            this.bufferedMessages = [];
        }

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data) as MessageFromWebSocketServer ;
            const type = message.type;
            if(this.callbacks[type]){
                this.callbacks[type].forEach(({callback}) => {
                    if(type == "GAME_INITIALISED"){
                        callback({
                            success : true,
                            data : message.data
                        })
                    }else if(type == 'PIECE_MOVE'){
                        callback(message.data)
                    }else if(type == 'SYNCED_POSITION'){
                        callback(message.data)
                    }else if(type === 'MESSAGE_SYNCED'){
                        callback(message.data)
                    }else if(type === 'MESSAGE'){
                        callback(message.data)
                    }
                })
            }
        }
    }



    public sendMessage(message: MessageToWebSocketServer) {
        const messageToSend = {
            ...message
        }
        if (!this.initialised) {
            this.bufferedMessages.push(messageToSend);
            return;
        }
        this.ws.send(JSON.stringify(messageToSend));
    }

    async registerCallback(type: string, callback: (data : any) => void, id: string) {
        this.callbacks[type] = this.callbacks[type] || [];
        this.callbacks[type].push({ callback, id });
    }

    async deRegisterCallback(type: string, id: string) {
        if (this.callbacks[type]) {
            const index = this.callbacks[type].findIndex(callback => callback.id === id);
            if (index !== -1) {
                this.callbacks[type].splice(index, 1);
            }
        }
    }
}