"use client"

import { Conversation } from "./conversation/conversation"
import { Sidebar } from "./sidebar/sidebar"

import styles from "./chat.module.scss"

export const Chat = () => {
    return (
        <div className={styles.wrapper}>
            <Sidebar />
            <Conversation />
        </div>
    )
}
