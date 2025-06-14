import { Button, Icon } from "~/ui/components"

import styles from "./userSettingsBar.module.scss"

export const UserSettingsBar = () => {
    return <div className={styles.userSettingsBar}>
        <span className={styles.userInfo}>
            <img src="/transparent.png" className={styles.userAvatar} />
            <h4 className={styles.username}>{"LoremIpsum"}</h4>
        </span>

        <Button variant="ghost">
            <Icon image="icons/settings.svg" size="large" />
        </Button>
    </div>
}