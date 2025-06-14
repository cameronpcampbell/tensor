import React, { useEffect, useRef, useState } from "react"

import type { ElementProps } from "@/utils/types"

import { Message } from "@/ui/components"
import { askLLM } from "@/backendWrapper/askLLM"


interface AIResponseMessage extends ElementProps<"section"> {
    msgContent: string,
    threadId: string,
    onDone?: (finalResult: string) => void,
    abortSignal?: AbortSignal
}

export const AIResponseMessage = ({ msgContent, threadId, onDone, abortSignal, ...rest }: AIResponseMessage) => {
    let [ response, setResponse ] = useState<string>("")
    let [ timestamp, setTimestamp ] = useState<number>(Date.now())

    let responseGotten = useRef<boolean>(false)

    useEffect(() => {
        if (responseGotten.current) return
        responseGotten.current = true

        askLLM({ msgContent, threadId, onDone, abortSignal, onChunk: setResponse, setTimestamp })
    }, [])

    return <Message highlighted author={{ name: "LoremIpsumBot", avatar: "" }} timestamp={timestamp} {...rest as any}>
        {response}
    </Message>
}