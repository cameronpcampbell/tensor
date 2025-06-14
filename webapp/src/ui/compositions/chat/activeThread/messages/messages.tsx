import { type ReactNode } from "react"

import styles from "./messages.module.scss"

interface MessagesProps {
    children: ReactNode
}

export const Messages = ({ children }: MessagesProps) => {
    return <section className={styles.messages}>
        <section className={styles.messagesInner}>
            { children }
        </section>
    </section>
}