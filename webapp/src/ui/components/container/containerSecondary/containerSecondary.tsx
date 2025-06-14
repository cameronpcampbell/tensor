"use client"

import type { ElementName } from "@/utils/types"

import { Squircle, type SquircleProps } from '@/ui/components'

import styles from "./containerSecondary.module.scss"

export const ContainerSecondary = <As extends ElementName,>({ className, cornerRadius = 8, children, ...rest }: SquircleProps<As>) => {
    return <Squircle
        className={[ styles.containerSecondary, className ].join(" ")}
        cornerRadius={cornerRadius}
        {...rest as any}
    >
        {children}
    </Squircle>
}