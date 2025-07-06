import { UserDetails } from "../types/types";

export async function getUser(id : string) : Promise<UserDetails> {
    if(id == '1'){
        return new Promise((resolve,reject) => {
            setTimeout(() => {
                resolve({
                    id : id,
                    name : "Ayush Gupta",
                    rating : 1400,
                })
            }, 1000);
        })
    }
    if(id == '2'){
        return new Promise((resolve,reject) => {
            setTimeout(() => {
                resolve({
                    id : id,
                    name : "Aman Kumar",
                    rating : 1350,
                })
            }, 400);
        })
    }
    return new Promise((resolve,reject) => {
        setTimeout(() => {
            resolve({
                id : id,
                name : "Unknown User "+id,
                rating : 1200,
            })
        }, 1000);
    })
}