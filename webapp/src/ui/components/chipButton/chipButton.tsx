"use client"

import { useState, type ReactNode } from "react"
import type { ElementProps } from "~/utils/types"

import styles from "./chipButton.module.scss"
import { FocusVisual } from "../focusVisual/focusVisual"

interface ChipButtonProps extends Omit<ElementProps<"button">, "as"> {
    icon?: string,
    dropdown?: ReactNode
}

export const ChipButton = ({ className, children, icon, dropdown, ...rest }: ChipButtonProps) => {
   const [ isFocus, setIsFocus ] = useState(false)
   let [ isMouseDown, setIsMouseDown ] = useState(false)

    return <FocusVisual parentCornerRadius={500} parentCornerSmoothing={0} isFocus={isMouseDown ? false : isFocus}>
        <button
            tabIndex={0}
            className={styles.chipButton}
            data-hasicon={icon ? true : false}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onMouseDown={() => setIsMouseDown(true)}
            onMouseUp={() => {
                setIsFocus(false)
                setIsMouseDown(false)
            }}
            {...rest}
        >
            {icon && <div className={styles.icon} role="img" style={{ maskImage: `url(${icon})`, WebkitMaskImage: `url(${icon})` }} />}
            {children}
            {dropdown && <div className={styles.dropdown} role="img" />}
        </button>
    </FocusVisual>
}