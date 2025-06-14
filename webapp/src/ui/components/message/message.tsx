import moment from "moment"

import { Markdown } from "@/ui/components"
import type { ElementProps } from "@/utils/types"

import styles from "./message.module.scss"

type MessageAuthorProps = {
    name: string,
    avatar: string
}

interface MessageProps extends ElementProps<"section"> {
    author: MessageAuthorProps,
    timestamp: number,
    children: string,
    highlighted?: boolean
}

const formatTimestamp = (timestamp: number) => {
    const input = moment(timestamp);
    const today = moment();

    if (input.isSame(today, 'day')) {
        return input.format('HH:mm');
    } else {
        return input.format('MM/DD/YYYY');
    }
}

export const Message = ({ author: { name, avatar }, timestamp, children, highlighted, ...rest }: MessageProps) => {
    return (
        <section data-highlighted={highlighted} className={styles.message} {...rest as any}>
            <span className={styles.author}>
                {avatar
                    ? <img src={avatar} className={styles.authorAvatar} />
                    : <div className={styles.authorAvatar} />
                }
                <h4 className={styles.authorName}>{name ?? "LoremIpsum"}</h4>
                <p className={styles.timestamp}>{formatTimestamp(timestamp)}</p>
            </span>

            <Markdown>
                {children}
            </Markdown>
        </section>
    )
}