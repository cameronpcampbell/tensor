"use client"

import { ChipButton, ContainerSecondary, Button, TextareaAutosize, FocusVisual, Icon } from "@/ui/components"

import styles from "./sendMessageBox.module.scss"
import { useMemo, useRef, useState } from "react"


interface SendMessageBoxProps {
    disabled?: boolean,
    onMsgSend?: (msgContent: string) => void,
    abortController?: AbortController,
    setAbortController?: (newAbortController: AbortController) => void
}

export const SendMessageBox = ({ disabled, onMsgSend, abortController, setAbortController }: SendMessageBoxProps) => {
    const [ isFocus, setIsFocus ] = useState(false)

    const [ textareaContent, setTextareaContent ] = useState<string>("")
    const textareaRef = useRef<HTMLTextAreaElement>(undefined as any)

    const [ shiftPressing, setShiftPressing ] = useState(false)

    const sendMsg = () => {
        let trimmedTextareaContent = textareaContent.trim()
        if (trimmedTextareaContent.length == 0) return

        (onMsgSend as (msgContent: string) => void)(trimmedTextareaContent)

        setTextareaContent("")
        textareaRef.current.value = ""
    }

    return (
        <FocusVisual isFocus={isFocus} parentCornerRadius={10}>
            <ContainerSecondary className={styles.sendMessageBox} cornerRadius={10}>
                <TextareaAutosize
                    rows={1} maxRows={10}
                    placeholder="Type your message here..."
                    ref={textareaRef as any}
                    onChange={e => setTextareaContent(e.target.value)}
                    onKeyDown={onMsgSend && ((e) => {
                        let key = e.key

                        if (key === "Enter" && !shiftPressing) {
                            e.preventDefault()
                            if (!disabled) sendMsg()    
                            return
                        }
                        
                        if (key === "Shift") {
                            setShiftPressing(true)
                        }
                    })}
                    onKeyUp={({ key }) => key === "Shift" && setShiftPressing(false)}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => {
                        setIsFocus(false)
                        setShiftPressing(false)
                    }}
                />

                <section className={styles.bottom}>
                    <section className={styles.modelOptions}>
                        <ChipButton dropdown={<></>}>Llama 3.1 (8B)</ChipButton>
                        <ChipButton icon="/icons/bulb.svg">Reason</ChipButton>
                    </section>

                    <section className={styles.messageOptions}>
                        <Button
                            variant="primary"
                            aria-disabled={textareaContent.trim().length === 0 && !disabled}
                            onClick={onMsgSend && (() => {
                                if (!disabled) { sendMsg() } else {
                                    abortController?.abort()
                                    setAbortController && setAbortController(new AbortController())
                                }
                            })}
                        >
                            <Icon image={`/icons/${disabled ? "stop" : "send"}.svg`} size="large" />
                        </Button>

                        <Button variant="ghost">
                            <Icon image="icons/upload.svg" size="large" />
                        </Button>

                        <Button variant="ghost">
                            <Icon image="icons/tools.svg" size="large" />
                        </Button>
                    </section>
                </section>
            </ContainerSecondary>
        </FocusVisual>
    )
}