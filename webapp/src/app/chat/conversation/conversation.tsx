import { ContainerPrimary } from "~/components"

import { SendMessageBox } from "./sendMessageBox/sendMessageBox"

import styles from "./conversation.module.scss"
import { Messages } from "./messages/messages"

export const Conversation = () => {
    return (
        <ContainerPrimary as="main" className={styles.conversation} bottomLeftCornerRadius={false} bottomRightCornerRadius={false}>
            <Messages />
            <SendMessageBox />
            <div className={styles.gradient} />
        </ContainerPrimary>
    )
}