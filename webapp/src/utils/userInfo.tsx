"use client"

import { useState, createContext, type ReactNode, useEffect, type SetStateAction, type Dispatch, useRef } from 'react';
import cookie from "cookie"
import { jwtDecode, type JwtPayload } from 'jwt-decode';

export const UserInfoContext = createContext<[ UserInfo | undefined, Dispatch<SetStateAction<UserInfo | undefined>> ]>(undefined as any)

export const UserInfoProvider = ({ children }: { children: ReactNode }) => {
    const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);

    useEffect(() => {
        let jwt = cookie.parse(document.cookie)["oauth.session"]
        if (!jwt) return

        let userInfo = getUserInfoFromJWT(jwt)
        setUserInfo(userInfo)
    }, [])

    return <UserInfoContext value={[ userInfo, setUserInfo ]}>{children}</UserInfoContext>;
}

export type UserInfo = {
    user_id: string,
    provider_user_id: number,
    provider_username: string,
    provider_avatar_url: string,
    provider_type: "github",
}

export const getUserInfoFromJWT = (jwt: string) => {
    let parsed = jwtDecode(jwt)

    return {
        user_id: (parsed as any).user_id,
        provider_user_id: (parsed as any).provider_user_id,
        provider_username: (parsed as any).provider_username,
        provider_avatar_url: (parsed as any).provider_avatar_url,
        provider_type: (parsed as any).provider_type,
    }
}