
export enum GAME_OVER_REASON {
    TIMEOUT = 'timeout',
    DRAW = 'draw',
    CHECKMATE = 'checkmate'
}

export enum GameCategory {
    BLITZ = 'blitz',
    BUTTETZ = 'bulletz',
    RAPID = 'rapid'
}

export enum ERROR_CODE {
    GAME_NOT_FOUND = 'game_not_found',
    GAME_NOT_STARTED = 'game_not_started',
    GAME_CODE_WRONG = 'game_code_wrong',
    GAME_ALREADY_STARTED = 'game_already_started'
}


export enum MatchType {
    ONLINE = 'online',
    BOT = 'bot',
    FRIEND = 'friend'
}

export enum USER_TYPE {
    PLAYER = 'player',
    SPECTATOR = 'spectator'
}









export type UserDetails = {
    id : string ,
    name : string,
    rating : number
}

export type MESSAGE = {
    from : string,
    message : string
}


export type INITIALISE_GAME_DATA_TYPE = {
    category : GameCategory,
    timeControl : string,
    isPublic? : boolean,
    matchType : MatchType
}
export type PendingPlayer = {
    id : string,
    name : string,
    rating : number,
    gameCategory : GameCategory,
    timeControl : string,
}

export type NEW_GAME = {
    white? : {
        id : string,
        name : string,
        rating : number
    },
    black? : {
        id : string, 
        name : string, 
        rating : number
    },
    gameData : {
        id : number,
        category : GameCategory,
        timeControl : string,
        isPublic : boolean,
        matchType : MatchType
    }
}







export type IncomingMessage = {       //done
    type : 'INITIALISE_GAME',
    data : INITIALISE_GAME_DATA_TYPE

} | {                         //done
    type : 'SYNC_BOARD',
    data : {
        gameId : number,
        user : USER_TYPE
    }
}  | {                          //done
    type : "SYNC_MESSAGE",
    data : {
        gameId : number,
    }
} | {
    type : "SYNC_MOVES",      //done
    data : {
        gameId : number
    }
} | {
    type : "SEND_MESSAGE",   //done
    data : {
        gameId : number,
        message : string,
    }
} | {                      
    type : 'ADD_MOVE',     //done
    data  : {
        gameId : number,
        from : string,
        to : string
    }
} | {
    type : "ADD_OTHER_PLAYER",     //done
    data : {
        gameId : number,
        code : string
    }
}






export type OutgoingMessage = {
    type : 'GAME_INITIALISED',     //done
    data : {
        gameId : number,
        code? : string, 
        success : boolean,
        message : string,
        w_name? : string,
        w_rating? : number,
        b_name? : string,
        b_rating? : number
    }
} | {
    type : 'ERROR',             //done
    data : {
        code : ERROR_CODE
    }
} | {
    type : 'GAME_OVER',
    data : {
        reason : GAME_OVER_REASON,
        w? : 'w' | 'b',
        l? : 'w' | 'b',
    }
} | {
    type : 'BOARD_SYNCED',    //done
    data : {
        fen : string,
        color? : 'w' | 'b',
        w_name? : string,
        w_rating? : number,
        b_name? : string,
        b_rating? : number,
        w_time? : number,
        b_time? : number,
        turn : 'w' | 'b'
    }
} | {
    type : "MESSAGE_SYNCED",   //done
    data : {
        messages : MESSAGE[]
    }
} | {
    type : 'MOVES_SYNCED',     //done
    data : {
        history : string[]
    }
} | {
    type : "MESSAGE",        //done
    data : {
        message : MESSAGE
    }
} | {
    type : 'MOVE_ADDED',    //done
    data : {
        from : string,
        to : string,
        w_t : number,
        b_t : number,
        turn : 'w' | 'b'
    }
} | {
    type : 'GAME_STARTED',    //done
    data : {
        success : boolean,
        message : string,
        w_name : string,
        w_rating : number,
        b_name : string,
        b_rating : number
    }
}



