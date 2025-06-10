import type { HTMLProps } from "react"

import { Squircle } from "../squircle/squircle"

import styles from "./button.module.scss"

export const Button = ({ className, children, ...rest }: Omit<HTMLProps<"button">, "as">) => {
    return (
        <Squircle cornerRadius={8} borderWidth={0} as="button" className={[ styles.button, className ].join(" ")} {...rest}>
            <Squircle cornerRadius={8} borderWidth={1} as="div" className={styles.highlight} />
            { children }
        </Squircle>
    )
}