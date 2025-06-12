"use client"

import { useRef, useState } from "react"

import { FocusVisual, ContainerSecondary, Icon } from "~/ui/components"
import type { ElementProps } from "~/utils/types"

import styles from "./textInput.module.scss"
import { KeyPrompt } from "../keyPrompt/keyPrompt"

interface TextInputProps extends ElementProps<"button"> {
    placeholder?: string,
    defaultValue?: string,
    value?: string,
    icon?: string,
    keyPrompt?: string
}

export const TextInput = ({
    className, children, placeholder, defaultValue, value, icon, keyPrompt, ...rest
}: TextInputProps) => {
    const inputRef = useRef<HTMLInputElement>(undefined)
    const [ isFocus, setIsFocus ] = useState(false)

    return <FocusVisual isFocus={isFocus} parentCornerRadius={8}>
        <ContainerSecondary className={[ className, styles.textInput ].join(" ")} onClick={() => inputRef.current?.focus()}>
            {icon && <Icon className={styles.icon} image={icon} size="small" />}

            <input
                placeholder={placeholder}
                defaultValue={defaultValue}
                value={value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                ref={inputRef}
                {...rest as any}
            />

            {keyPrompt && <KeyPrompt className={styles.keyPrompt}>{keyPrompt}</KeyPrompt>}
        </ContainerSecondary>
    </FocusVisual>
}