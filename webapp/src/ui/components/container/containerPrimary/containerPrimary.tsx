"use client"

import type { ElementName } from '~/utils/types'

import { Squircle, type SquircleProps } from '../../squircle/squircle'

import styles from "./containerPrimary.module.scss"

export const ContainerPrimary = <As extends ElementName,>({ className, children, ...rest }: SquircleProps<As>) => {
    return <Squircle
        className={[ styles.containerPrimary, className ].join(" ")}
        cornerRadius={15}
        {...rest as any}
    >
        {children}
    </Squircle>
}