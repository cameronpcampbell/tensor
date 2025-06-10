"use client"

import { Squircle, type AsType, type SquircleProps } from '../../squircle/squircle'

import styles from "./containerSecondary.module.scss"

export const ContainerSecondary = <As extends AsType,>({ className, children, ...rest }: SquircleProps<As>) => {
    return <Squircle
        className={[ styles.containerSecondary, className ].join(" ")}
        cornerRadius={8}
        borderWidth={1}
        {...rest as any}
    >
        {children}
    </Squircle>
}