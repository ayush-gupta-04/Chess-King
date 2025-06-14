import CredentialsProvider  from "next-auth/providers/credentials"



export const NEXT_AUTH = {
    providers : [
        CredentialsProvider({
            name : "Email",
            credentials : {
                username: { label: "username", type: "text" },
                password: { label: "username", type: "text" }
            },
            async authorize(credentials? : {username : string,password : string}){ 
                if(credentials?.username == 'ayushgupta'){
                    return {
                        id : '1',
                        name : 'Ayush Gupta',
                    }
                }
                else if(credentials?.username == 'otherplayer'){
                    return {
                        id : "2",
                        name : 'Magnus Kumar'
                    }
                }
                return null;
            }
        })
    ],
    pages : {
        signIn : '/auth/login',
        signOut : '/auth/login'
    },
    secret : process.env.NEXTAUTH_SECRET,
    callbacks : {
        session : ({session , token} : any) => {
            session.user.id = token.sub;
            return session;
        }
    }
}