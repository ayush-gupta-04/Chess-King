'use client'
import { SessionProvider } from "next-auth/react";
import React from 'react';

type Children = {
    children : React.ReactNode
}
export default function Providers({children} : Children){
    return(
        <SessionProvider>
            {children} 
        </SessionProvider>
    )
}