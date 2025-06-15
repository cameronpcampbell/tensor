"use client"

import { useState, createContext, type ReactNode, useEffect, type SetStateAction, type Dispatch, useRef } from 'react';
import cookie from "cookie"
import { jwtDecode, type JwtPayload } from 'jwt-decode';

export const UserInfoContext = createContext<[ UserInfo, Dispatch<SetStateAction<UserInfo>> ]>(undefined as any)

export const UserInfoProvider = ({ children }: { children: ReactNode }) => {
    const [userInfo, setUserInfo] = useState<UserInfo>({} as any);

    useEffect(() => {
        let jwt = cookie.parse(document.cookie)["oauth.session"]
        if (!jwt) return

        let userInfo = getUserInfoFromJWT(jwt)
        setUserInfo(userInfo)
    }, [])

    return <UserInfoContext value={[ userInfo, setUserInfo ]}>{children}</UserInfoContext>;
}

export type UserInfo = {
    id: number,
    login: string,
    avatar_url: string
}

export const getUserInfoFromJWT = (jwt: string) => {
    let parsed = jwtDecode(jwt)

    return {
        id: (parsed as any).id,
        login: (parsed as any).login,
        avatar_url: (parsed as any).avatar_url
    }
}