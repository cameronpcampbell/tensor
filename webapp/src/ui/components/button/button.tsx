"use client"

import type { ElementProps } from "~/utils/types"

import { Squircle, type CornerSmoothingProps } from "../squircle/squircle"

import styles from "./button.module.scss"
import { SquircleBorder } from "../squircle/squircleBorder"
import { FocusVisual } from "../focusVisual/focusVisual"
import { useState } from "react"
import { KeyPrompt } from "../keyPrompt/keyPrompt"

interface ButtonProps extends ElementProps<"button">, CornerSmoothingProps {
    variant?: "primary" | "ghost",
    fill?: boolean,
    align?: "left" | "right" | "center",
    keyPrompt?: string
}

export const Button = ({
    variant = "primary", className, children, fill, align = "center", keyPrompt, cornerRadius = 8, ...rest
}: ButtonProps) => {
    let [ isFocus, setIsFocus ] = useState(false)
    let [ isMouseDown, setIsMouseDown ] = useState(false)

    return (
        <FocusVisual isFocus={isMouseDown ? false : isFocus} parentCornerRadius={cornerRadius}>
            <Squircle
                tabIndex={0}
                cornerRadius={8}
                as="button"
                className={[ styles.button, styles[variant], fill && styles.fill, styles[align], className ].join(" ")}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onMouseDown={() => setIsMouseDown(true)}
                onMouseUp={() => {
                    setIsFocus(false)
                    setIsMouseDown(false)
                }}
                {...rest}
            >
                <SquircleBorder cornerRadius={cornerRadius} className={styles.highlight} />

                <section className={styles.leftContent}>{ children }</section>

                {keyPrompt && <KeyPrompt className={styles.keyPrompt}>{keyPrompt}</KeyPrompt>}
            </Squircle>
        </FocusVisual>
    )
}