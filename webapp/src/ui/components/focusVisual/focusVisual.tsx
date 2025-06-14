"use client"

import { type ReactElement } from "react"

import { SquircleBorder } from "../squircle/squircleBorder"
import type { ElementProps } from "@/utils/types"

import styles from "./focusVisual.module.scss"

interface FocusVisualProps extends ElementProps<"div"> {
    isFocus: boolean,
    parentCornerRadius: number,
    parentCornerSmoothing?: number,
    children: ReactElement
}

export const FocusVisual = ({
    isFocus, parentCornerRadius, children, parentCornerSmoothing = 1, style
}: FocusVisualProps) => {
    if (parentCornerSmoothing !== 0) {
        return <div className={styles.wrapper}>
            <SquircleBorder
                className={[ styles.focusVisual, isFocus && styles.enabled ].join(" ")}
                cornerRadius={parentCornerRadius + 3}
                borderWidth={3.1}
            />
            {children}
        </div>

    } else {
        return <div className={styles.wrapper}>
            <div
                className={[ styles.focusVisual, styles.noSmoothing, isFocus && styles.enabled ].join(" ")}
                style={{ borderRadius: parentCornerRadius + 3 }}
            />
            {children}
        </div>
    }
}