import { Button, Icon } from "@/ui/components"
import type { UserInfo } from "@/utils/userInfo"

import styles from "./userSettingsBar.module.scss"

export const UserSettingsBar = ({ userInfo }: { userInfo?: UserInfo }) => {
    const avatar_url = userInfo?.provider_avatar_url
    const username = userInfo?.provider_username

    return <div className={styles.userSettingsBar}>
        <span className={styles.userInfo}>
            {avatar_url
                ? <img src={avatar_url} className={styles.userAvatar} />
                : <div className={styles.userAvatar} />
            }
            <h4 className={styles.username}>{username ?? "Guest"}</h4>
        </span>

        {userInfo
            ? (
                <Button variant="ghost">
                    <Icon image="icons/settings.svg" size="large" />
                </Button>
            ) : (
                <Button variant="ghost">
                    <Icon image="icons/login.svg" size="large" />
                </Button>
            )
        }
    </div>
}