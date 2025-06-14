import { GetInitialPieceMap, isLight } from "../../../utils/helper-functions";


export default function FakeChessBoard(){
    const initialMappedPieces : Record<string,string> = GetInitialPieceMap();
    const ranks = ['8','7','6','5','4','3','2','1'] 
    const files =  ['a','b','c','d','e','f','g','h'] 
    const board : string[][] = ranks.map(r => files.map(f => `${f}${r}`));

    return (
        <div className="bg-white size-[480px] md:size-[576px] lg:size-[720px] grid grid-cols-8 place-items-center">
            {board.map(arr => arr.map(coordinate => {
                const isLightTile = isLight(coordinate);
                const rank : string= coordinate.charAt(1);
                const file : string= coordinate.charAt(0);
                const pieceCode = initialMappedPieces[coordinate];
               

                return (
                    <div key = {coordinate} className={`${isLightTile ? "bg-light-tile text-dark-tile" : "bg-dark-tile text-light-tile"} h-full flex w-full p-1 font-semibold relative `}  
                        >
                        {rank == '1' && 
                            <div className="absolute bottom-1 right-1 " >{file}</div>
                        }
                        {file == 'a' &&  
                            <div className="absolute top-1 left-1">{rank}</div>
                        }
                        {pieceCode && 
                            <img 
                                src = {`/pieces/${pieceCode}.png`} 
                                className={` z-10 bg-center size-full bg-cover absolute bg-no-repeat top-0 left-0 active:cursor-grabbing hover:cursor-grab object-containa`} 
                            ></img>
                        }
                    </div>
                )   
            }))}
        </div>
    )
}