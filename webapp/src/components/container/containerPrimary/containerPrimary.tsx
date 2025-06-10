"use client"

import { Squircle, type AsType, type SquircleProps } from '../../squircle/squircle'

import styles from "./containerPrimary.module.scss"

export const ContainerPrimary = <As extends AsType,>({ className, children, ...rest }: SquircleProps<As>) => {
    return <Squircle
        className={[ styles.containerPrimary, className ].join(" ")}
        cornerRadius={15}
        {...rest as any}
    >
        {children}
    </Squircle>
}