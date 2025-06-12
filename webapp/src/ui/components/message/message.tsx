import type { ElementProps } from "~/utils/types"
import moment from "moment"

import styles from "./message.module.scss"
import { micromark } from "micromark"

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

export const Message = ({ author, timestamp, children, highlighted, ...rest }: MessageProps) => {
    return (
        <section data-highlighted={highlighted} className={styles.message} {...rest as any}>
            <span className={styles.author}>
                <img src="/transparent.png" className={styles.authorAvatar} />
                <h4 className={styles.authorName}>{author?.name ?? "LoremIpsum"}</h4>
                <p className={styles.timestamp}>{formatTimestamp(timestamp)}</p>
            </span>

            <p className={styles.content} dangerouslySetInnerHTML={{ __html: micromark(children) }} />
        </section>
    )
}