import { Conversation } from "./conversation/conversation"
import { Sidebar } from "./sidebar/sidebar"

import styles from "./chat.module.scss"

export default () => (
    <div className={styles.wrapper}>
        <Sidebar />
        <Conversation />
    </div>
)
