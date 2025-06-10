import { Message } from "~/components"

import styles from "./messages.module.scss"

export const Messages = () => {
    return <section className={styles.messages}>
        <Message author={{ name: "CameronCampbell (You)", avatar: "" }} timestamp="20:07">
            Hello!
        </Message>

        <Message author={{ name: "LoremIpsumBot", avatar: "" }} timestamp="20:07" highlighted>
            Hello there! I'm an AI designed to help answer your questions, provide information on various topics, and even have some fun conversations. My purpose is to assist and communicate with you as effectively as possible. What's on your mind? Want to chat about something specific or just see where our conversation takes us?
        </Message>

        <Message author={{ name: "CameronCampbell (You)", avatar: "" }} timestamp="20:07">
            What is 2 + 2?
        </Message>
    </section>
}