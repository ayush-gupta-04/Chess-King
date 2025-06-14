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