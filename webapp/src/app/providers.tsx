"use client"

import type { ReactNode } from "react"

import { UserInfoProvider } from "~/utils/userInfo"
import { KeysDownProvider } from "~/utils/keysDown"

export const Providers = ({ children }: { children: ReactNode }) => {
    return <KeysDownProvider>
        <UserInfoProvider>
            {children}
        </UserInfoProvider>
    </KeysDownProvider>
}