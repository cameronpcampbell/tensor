"use client"

import { useState, type ReactNode } from "react"

import { ContainerPrimary, Message } from "~/ui/components"
import { Messages } from "./messages/messages"
import { SendMessageBox } from "./sendMessageBox/sendMessageBox"
import { AIResponseMessage } from "./aiResponseMessage/aiResponseMessage"

import styles from "./conversation.module.scss"

export const Conversation = () => {
    let [ messages, setMessages ] = useState<ReactNode[]>([])
    let [ canSendMsg, setCanSendMsg ] = useState<boolean>(true)

    let [ abortController, setAbortController ] = useState(new AbortController())

    const handleOnMsgSend = (msgContent: string) => {
        setCanSendMsg(false)

        let messagesLen = messages.length

        setMessages(prevMessages => [
            ...prevMessages,
            <Message
                key={messagesLen + 1}
                author={{ name: "Cameron Campbell (You)", avatar: "" }}
                timestamp={Date.now()
            }>
                {msgContent}
            </Message>,

            <AIResponseMessage
                key={messagesLen + 2}
                msgContent={msgContent}
                conversationId="12345"
                onDone={() => setCanSendMsg(true)}
                abortSignal={abortController.signal}
            />
        ])
    }

    return (
        <ContainerPrimary as="main" className={styles.conversation} bottomLeftCornerRadius={false} bottomRightCornerRadius={false}>
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