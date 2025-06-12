"use client"

import { useState, createContext, type ReactNode, useEffect } from 'react';

export const KeysDownContext = createContext<Set<string>>(new Set())

export const KeysDownProvider = ({ children }: { children: ReactNode }) => {
    const [keysDown, setKeysDown] = useState<Set<string>>(new Set());

    const downHandler = (e: KeyboardEvent) => {
        setKeysDown(prev => {
            const newSet = new Set(prev)
            newSet.add(e.key)
            return newSet
        })
    }

    const upHandler = (e: KeyboardEvent) => {
        setKeysDown(prev => {
            const newSet = new Set(prev)
            newSet.delete(e.key)
            return newSet
        });
    };

    const blurHandler = () => setKeysDown(new Set())

    useEffect(() => {
        document.addEventListener("keydown", downHandler)
        document.addEventListener("keyup", upHandler)
        document.addEventListener("blur", blurHandler)
    }, [])

    return <KeysDownContext value={keysDown}>{children}</KeysDownContext>;
}