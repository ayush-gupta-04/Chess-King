export function getCode() : string{
    let code = '';
    for(let i = 0 ; i < 4 ; i++){
        const a = Math.floor(Math.random()*10);
        code = code + a;
    }
    return code;
}