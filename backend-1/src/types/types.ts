export type IncomingMessageFromClient = {
    type : 'INITIALISE_GAME'
} | {
    type : 'ADD_MOVE',
    data  : {
        gameId : number,
        from : string,
        to : string
    }
} | {
    type : 'JOIN_GAME',
    data : {
        gameId : number
    }
} | {
    type : "SEND_MESSAGE",
    data : {
        gameId : number,
        message : string,
        time : Date
    }
} | {
    type : "MESSAGE_SYNC",
    data : {
        gameId : number,
    }
}






export type OutgoingMessageToClient = {
    type : 'GAME_INITIALISED',
    data : {
        gameId : number
    }
} | {
    type : 'GAME_NOT_FOUND',
    data : {
        error : string
    }
} | {
    type : "INVALID_MOVE",
    data : {
        error : string
    }
} | {
    type : "GAME_OVER",
    data : {
        isDraw : boolean,
        winner : 'w' | 'b' | null
    }
} | {
    type : "PIECE_MOVE",
    data : {
        from : string,
        to : string
    }
} | {
    type : "SYNCED_POSITION",
    data : {
        fen : string,
        color : 'w' | 'b',
        history : string[]
    }
} | {
    type : "MESSAGE",
    data : {
        from : string,
        message : string,
        time : Date
    }
} | {
    type : "MESSAGE_SYNCED",
    data : {
        messages : {
            from: string;
            message: string;
            time: Date;
        }[]
    }
}
