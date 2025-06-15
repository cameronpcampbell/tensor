import { streamBodyCallback } from "./streamBodyCallback";

interface sendMessageProps {
    msgContent: string,
    threadId: string,
    onChunk: (result: string) => void,
    onDone?: (finalResult: string) => void,
    setTimestamp?: (timestamp: number) => void,
    abortSignal?: AbortSignal
}

export const sendMessage = async ({ msgContent, threadId, onChunk, onDone, setTimestamp, abortSignal }: sendMessageProps) => {
    let result = ""

    try {
        let response = await fetch(`http://127.0.0.1:8080/thread/chat/${threadId}`, {
            method: "POST",
            body: msgContent,
            headers: {
                "Content-Type": "text/plain"
            },
            signal: abortSignal
        })

        if (setTimestamp) {
            let timestampHeader = response.headers.get("X-Timestamp")
            let timestamp = timestampHeader ? parseInt(timestampHeader) : 0
            setTimestamp(timestamp)
        }

        result = await streamBodyCallback(response.body?.getReader(), onChunk)

        onDone && onDone(result)
    } catch (err: any) {
        if (err?.name !== 'AbortError') return
        onDone && onDone(result)
    }
}