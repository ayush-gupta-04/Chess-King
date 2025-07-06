export function isLight(coordinate : string){
    const r = coordinate.charCodeAt(1);
    const f = coordinate.charCodeAt(0);
    return (r + f)%2 == 1;
}


export function GetInitialPieceMap() : Record<string,string>{
    const initialMappedPieces : Record<string,string> = {
        'a8' : 'br', 'b8' : 'bn' , 'c8' : 'bb' , 'd8' : 'bq' , 'e8' : 'bk', 'f8' : 'bb' , 'g8' : 'bn' , 'h8' : 'br',
        'a7' : 'bp', 'b7' : 'bp' , 'c7' : 'bp' , 'd7' : 'bp' , 'e7' : 'bp', 'f7' : 'bp' , 'g7' : 'bp' , 'h7' : 'bp', 
        'a2' : 'wp', 'b2' : 'wp' , 'c2' : 'wp' , 'd2' : 'wp' , 'e2' : 'wp', 'f2' : 'wp' , 'g2' : 'wp' , 'h2' : 'wp', 
        'a1' : 'wr', 'b1' : 'wn' , 'c1' : 'wb' , 'd1' : 'wq' , 'e1' : 'wk', 'f1' : 'wb' , 'g1' : 'wn' , 'h1' : 'wr',
    }
    return initialMappedPieces;
}


export function getRowCol(coordinate : string) : {row : number , col : number}{
    const row = coordinate.charCodeAt(1) - 49;
    const col = coordinate.charCodeAt(0) - 97;
    return {
        row,
        col
    }
}


export function mapFenToBoard(fen : string){
    const [placement] = fen.split(' ');
    const rows = placement.split('/');
    const ranks = ['8','7','6','5','4','3','2','1'];
    const files = ['a','b','c','d','e','f','g','h'];

    const newPosition : Record<string,string> = {}

    //it will loop from rank 8 to 1.
    rows.forEach((rank,rankIndex) => {
        let fileIndex = 0;

        //for every character of row.
        for(const char of rank){

            //if an empty square..skip.
            //Digit rpresents empty squares.
            if(/\d/.test(char)){
                fileIndex += parseInt(char);
            }else{
                const rank = ranks[rankIndex];
                const file = files[fileIndex];
                const isWhite = char === char.toUpperCase();
                const pieceType = char.toLowerCase();
                const coordinate = `${file}${rank}`;;
                const piece = (isWhite ? 'w'  :'b' ) + pieceType;
                newPosition[coordinate] = piece;
                fileIndex++;
            }
        }
    })

    return newPosition;
}