import type { HTMLProps } from "react"

import styles from "./message.module.scss"

type MessageAuthorProps = {
    name: string,
    avatar: string
}

interface MessageProps extends Omit<HTMLProps<"button">, "as"> {
    author: MessageAuthorProps,
    timestamp: string /* Date */,
    children: string,
    highlighted?: boolean
}

export const Message = ({ author, timestamp, children, highlighted, ...rest }: MessageProps) => {
    return (
        <section data-highlighted={highlighted ? true : undefined} className={styles.message} {...rest as any}>
            <span className={styles.author}>
                <img src="/transparent.png" className={styles.authorAvatar} />
                <h4 className={styles.authorName}>{author?.name ?? "LoremIpsum"}</h4>
                <p className={styles.timestamp}>{timestamp}</p>
            </span>

            <p className={styles.content} data-mode="body1">{children}</p>
        </section>
    )
}