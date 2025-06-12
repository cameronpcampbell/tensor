import { Icon } from "../icon/icon"
import type { ElementProps } from "~/utils/types"

import styles from "./heading.module.scss"

interface HeadingChildren extends ElementProps<"h3"> {
    icon: string
}

export const Heading = ({ children, icon, className }: HeadingChildren) => {
    return <h3 className={[ styles.heading, className ].join(" ")}>
        <Icon image={icon} size="small" />
        {children}
    </h3>
}