interface AskLLMProps {
    msgContent: string,
    threadId: string,
    onChunk: (result: string) => void,
    onDone?: (finalResult: string) => void,
    setTimestamp?: (timestamp: number) => void,
    abortSignal?: AbortSignal
}

export const askLLM = async ({ msgContent, threadId, onChunk, onDone, setTimestamp, abortSignal }: AskLLMProps) => {
    let result = '';

    try {
        let response = await fetch(`http://127.0.0.1:8080/chat/${threadId}`, {
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

        let reader = response.body?.getReader()
        if (!reader) { return }

        const decoder = new TextDecoder("utf-8");

        let { done, value } = await reader.read();

        while (!done) {
            let decoded = decoder.decode(value, { stream: true })

            result += decoder.decode(value, { stream: true });

            onChunk(result);

            ({ done, value } = await reader.read());
        }

        onDone && onDone(result)
    } catch (err: any) {
        if (err?.name !== 'AbortError') return
        onDone && onDone(result)
    }
}


/*


createReadStream('example.md')
  .on('error', handleError)
  .pipe(stream())
  .pipe(process.stdout)

function handleError(error) {
  // Handle your error here!
  throw error
}

*/