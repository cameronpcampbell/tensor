import { Chip, ContainerSecondary, Button, TextareaAutosize } from "~/components"

import styles from "./sendMessageBox.module.scss"


export const SendMessageBox = () => {
    return <ContainerSecondary className={styles.sendMessageBox} cornerRadius={10}>
        <TextareaAutosize rows={1} maxRows={10} placeholder="Type your message here..." />

        <section className={styles.bottom}>
            <section className={styles.options}>
                <Chip dropdown={<></>}>Llama 3.1 (8B)</Chip>
                <Chip icon="/icons/globe.svg">Web Search</Chip>
                <Chip icon="/icons/upload.svg">Upload</Chip>
            </section>

            <Button className={styles.sendMessageButton}>
                <div className={styles.sendIcon} />
            </Button>
        </section>
    </ContainerSecondary>
}