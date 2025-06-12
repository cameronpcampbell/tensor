"use client"

import type { ReactNode } from "react"
import { KeysDownProvider } from "~/utils/keysDown"

export const Providers = ({ children }: { children: ReactNode }) => {
    return <KeysDownProvider>
        {children}
    </KeysDownProvider>
}