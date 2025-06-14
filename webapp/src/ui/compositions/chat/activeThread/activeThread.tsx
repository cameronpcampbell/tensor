"use client"

import { use, useState, type ReactNode } from "react"

import { UserInfoContext } from "@/utils/userInfo"

import { ContainerPrimary, Message } from "@/ui/components"
import { Messages } from "./messages/messages"
import { SendMessageBox } from "./sendMessageBox/sendMessageBox"
import { AIResponseMessage } from "./aiResponseMessage/aiResponseMessage"

import styles from "./activeThread.module.scss"

export const ActiveThread = () => {
    let [ messages, setMessages ] = useState<ReactNode[]>([])
    let [ canSendMsg, setCanSendMsg ] = useState<boolean>(true)

    let [ abortController, setAbortController ] = useState(new AbortController())

    let [ userInfo ] = use(UserInfoContext)

    const handleOnMsgSend = (msgContent: string) => {
        setCanSendMsg(false)

        let messagesLen = messages.length

        setMessages(prevMessages => [
            ...prevMessages,
            <Message
                key={messagesLen + 1}
                author={{ name: `${userInfo.login} (You)`, avatar: userInfo.avatar_url }}
                timestamp={Date.now()
            }>
                {msgContent}
            </Message>,

            <AIResponseMessage
                key={messagesLen + 2}
                msgContent={msgContent}
                threadId="12345"
                onDone={() => setCanSendMsg(true)}
                abortSignal={abortController.signal}
            />
        ])
    }

    return (
        <ContainerPrimary as="main" className={styles.thread} bottomLeftCornerRadius={false} bottomRightCornerRadius={false}>
            <Messages>{ messages }</Messages>

            <span className={styles.sendMessageBoxWrapper}>
                <SendMessageBox
                    disabled={!canSendMsg}
                    onMsgSend={handleOnMsgSend}
                    abortController={abortController}
                    setAbortController={setAbortController}
                />
            </span>

            <div className={styles.gradient} />
        </ContainerPrimary>
    )
}