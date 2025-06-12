"use client"

import { useEffect, type ReactElement } from "react"
import { SquircleBorder } from "../squircle/squircleBorder"

import styles from "./focusVisual.module.scss"

interface FocusVisualProps {
    isFocus: boolean,
    parentCornerRadius: number,
    children: ReactElement
}

export const FocusVisual = ({ isFocus, parentCornerRadius, children }: FocusVisualProps) => {
    return <div className={styles.wrapper}>
        <SquircleBorder
            className={[ styles.focusVisual, isFocus && styles.enabled ].join(" ")}
            cornerRadius={parentCornerRadius + 3}
            borderWidth={3.1}
        />
        {children}
    </div>
}