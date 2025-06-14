"use client"

import { ActiveThread } from "./activeThread/activeThread"
import { Sidebar } from "./sidebar/sidebar"

import styles from "./chat.module.scss"

export const Chat = () => {
    return (
        <div className={styles.wrapper}>
            <Sidebar />
            <ActiveThread />
        </div>
    )
}
