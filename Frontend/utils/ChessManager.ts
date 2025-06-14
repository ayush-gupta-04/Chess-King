import { getRowCol } from "./helper-functions";

export class ChessManager {
    private board : string[][];
    private player : "w" | 'b';
    constructor (player : 'w'|'b'){
        this.player = player;
        this.board = [
            ['wr','wn','wb','wq','wk','wb','wn','wr'],
            ['wp','wp','wp','wp','wp','wp','wp','wp'],
            ['.','.','.','.','.','.','.','.',],
            ['.','.','.','.','.','.','.','.',],
            ['.','.','.','.','.','.','.','.',],
            ['.','.','.','.','.','.','.','.',],
            ['bp','bp','bp','bp','bp','bp','bp','bp'],
            ['br','bn','bb','bq','bk','bb','bn','br'],
        ]
    }


    isValidMove(from : string, to:string){
        const sIndex = getRowCol(from);
        const eIndex = getRowCol(to);
        const startPiece = this.board[sIndex.row][sIndex.col];
        const targetPiece = this.board[eIndex.row][eIndex.col];
        const movingPieceColor = startPiece.charAt(0);                   //the piece without color
        if(movingPieceColor != this.player){
            return false;
        }

        //if startPiece is pawn.
        if(startPiece.charAt(1) == 'p'){
            return this.forPawn(startPiece,sIndex,eIndex,targetPiece);
        }
        return false;

    }

    private forPawn(startPiece : string, sIndex : {row : number,col : number} , eIndex : {row : number,col : number} , targetPiece : string){
        const jumpY = eIndex.row - sIndex.row
        const jumpX = eIndex.col - sIndex.col;
        if(startPiece == 'bp'){
            //+ve jump of black pawn means that it is moving backward.
            // if(jumpY > 0){
            //     return false;
            // }
            // if(sIndex.row == 5){
            //     if(Math.abs(jumpY) <= 2){
            //         return true;
            //     }
            //     return false;
            // }else if(sIndex.row < 5){
            //     if(Math.abs(jumpY) <= 1){
            //         return true;
            //     }
            //     return false;
            // }
            return true;
        }else if(startPiece == 'wp'){
            if(jumpY < 0){
                return false;
            }

            //initial position of pawn
            if(sIndex.row == 1){

                //forward moving
                if(Math.abs(jumpY) == 1 && Math.abs(jumpX) == 0 && targetPiece == '.'){
                    return true;
                }
                if(Math.abs(jumpY) == 2 && Math.abs(jumpX) == 0 && targetPiece == '.'){
                    return true;
                }
                if(Math.abs(jumpY) > 2){
                    return false;
                }


                //attacking
                if(Math.abs(jumpX) == 1 && Math.abs(jumpY) == 1 && targetPiece != '.'){
                    return true;
                }
                return false;
            }else if(sIndex.row > 1){
                if(Math.abs(jumpY) <= 1){
                    return true;
                }
                return false;
            }
        }
    }
}