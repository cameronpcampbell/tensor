import type { ElementProps } from "@/utils/types"

import styles from "./icon.module.scss"

interface ButtonIconProps extends ElementProps<"div"> {
    image: string,
    size?: "small" | "large"
}

export const Icon = ({ image, className, size = "small" }: ButtonIconProps) => {
    let url = `url(${image})`

    return <div role="img" className={[ styles.icon, styles[size], className ].join(" ")} style={{ maskImage: url, WebkitMaskImage: url }} />
}