import { Squircle } from "@/ui/components"

import styles from "./inlineCode.module.scss"

export const InlineCode = ({
    className, children
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>) => {
    return <Squircle cornerRadius={8} className={[ className, styles.inlineCode ].join(" ")} as="code">
        {children}
    </Squircle>
}