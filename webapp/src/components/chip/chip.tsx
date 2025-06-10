import type { HTMLProps, ReactElement } from "react"

import styles from "./chip.module.scss"

interface ChipProps extends Omit<HTMLProps<"button">, "as"> {
    icon?: string,
    dropdown?: ReactElement
}

export const Chip = ({ className, children, icon, dropdown, ...rest }: ChipProps) => {
    return <button
        className={styles.chip}
        data-hasicon={icon ? true : false}
    >
        {icon && <div className={styles.icon} role="img" style={{ maskImage: `url(${icon})`, WebkitMaskImage: `url(${icon})` }} />}
        {children}
        {dropdown && <div className={styles.dropdown} role="img" />}
    </button>
}