export const streamBodyCallback = async (
    reader: ReadableStreamDefaultReader<Uint8Array> | undefined,
    onChunk: (result: string) => void
): Promise<string> => {
    if (!reader) { return "" }

    let result = ""

    const decoder = new TextDecoder("utf-8");

    let { done, value } = await reader.read();

    while (!done) {
        result += decoder.decode(value, { stream: true });

        onChunk(result);

        ({ done, value } = await reader.read());
    }

    return result
}