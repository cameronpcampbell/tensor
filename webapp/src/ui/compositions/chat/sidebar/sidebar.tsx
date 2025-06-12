import { Button, TextInput, Icon, Heading } from "~/ui/components"

import styles from "./sidebar.module.scss"

export const Sidebar = () => {
    return <aside className={styles.sidebar}>
        <section className={styles.top}>
            <TextInput placeholder="Filter Threads" icon="icons/search.svg" keyPrompt="⌘K" />

            <Button variant="ghost" fill align="left" keyPrompt="⌘C">
                <Icon image="icons/plus.svg" size="small" />
                Create Thread
            </Button>
        </section>

        <section className={styles.threads}>
            <Heading icon="./icons/pin.svg">Pinned Threads</Heading>

            <ul role="listbox" className={styles.items}>
                <li><Button variant="ghost" aria-setsize={4} aria-posinset={1} fill align="left">
                    <Icon image="icons/thread.svg" size="small" />
                    Placing bets on sports game outcome.
                </Button></li>

                <li><Button variant="ghost" aria-setsize={4} aria-posinset={2} fill align="left">
                    <Icon image="icons/thread.svg" size="small" />
                    Debating the merits of veganism loudly.
                </Button></li>
                
                <li><Button variant="ghost" aria-setsize={4} aria-posinset={3} fill align="left">
                    <Icon image="icons/thread.svg" size="small" />
                    Planning a surprise birthday party secretly.
                </Button></li>
            </ul>
        </section>

        <section className={styles.threads}>
            <Heading icon="./icons/clock.svg">Temporary Threads</Heading>

            <ul role="listbox" className={styles.items}>
                <li><Button variant="ghost" aria-setsize={4} aria-posinset={1} fill align="left">
                    <Icon image="icons/thread.svg" size="small" />
                    Arguing about politics at dinner table.
                </Button></li>

                <li><Button variant="ghost" aria-setsize={4} aria-posinset={2} fill align="left">
                    <Icon image="icons/thread.svg" size="small" />
                    Sharing travel experiences with old friend.
                </Button></li>

                <li><Button variant="ghost" aria-setsize={4} aria-posinset={3} fill align="left">
                    <Icon image="icons/thread.svg" size="small" />
                    Negotiating salary for new job offer.
                </Button></li>

                <li><Button variant="ghost" aria-setsize={4} aria-posinset={3} fill align="left">
                    <Icon image="icons/thread.svg" size="small" />
                    Talking to therapist about anxiety issues.
                </Button></li>
            </ul>
        </section>
    </aside>
}