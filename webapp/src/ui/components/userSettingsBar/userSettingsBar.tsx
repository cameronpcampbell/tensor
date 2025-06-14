import { Button, Icon } from "~/ui/components"
import type { UserInfo } from "~/utils/userInfo"

import styles from "./userSettingsBar.module.scss"

export const UserSettingsBar = ({ userInfo }: { userInfo: UserInfo }) => {
    return <div className={styles.userSettingsBar}>
        <span className={styles.userInfo}>
            <img src={userInfo.avatar_url} className={styles.userAvatar} />
            <h4 className={styles.username}>{userInfo.login}</h4>
        </span>

        <Button variant="ghost">
            <Icon image="icons/settings.svg" size="large" />
        </Button>
    </div>
}