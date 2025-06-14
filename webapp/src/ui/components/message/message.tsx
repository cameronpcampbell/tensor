import moment from "moment"

import { Markdown } from "~/ui/components"
import type { ElementProps } from "~/utils/types"

import styles from "./message.module.scss"

type MessageAuthorProps = {
    name: string,
    avatar: string
}

interface MessageProps extends ElementProps<"section"> {
    author: MessageAuthorProps,
    timestamp: number,
    children: string,
    highlighted?: boolean
}

const formatTimestamp = (timestamp: number) => {
    const input = moment(timestamp);
    const today = moment();

    if (input.isSame(today, 'day')) {
        return input.format('HH:mm');
    } else {
        return input.format('MM/DD/YYYY');
    }
}

export const Message = ({ author: { name, avatar }, timestamp, children, highlighted, ...rest }: MessageProps) => {
    return (
        <section data-highlighted={highlighted} className={styles.message} {...rest as any}>
            <span className={styles.author}>
                <img src={avatar ? avatar : "transparent.png"} className={styles.authorAvatar} />
                <h4 className={styles.authorName}>{name ?? "LoremIpsum"}</h4>
                <p className={styles.timestamp}>{formatTimestamp(timestamp)}</p>
            </span>

            <Markdown>
                {children}
            </Markdown>
        </section>
    )
}


/*
There are several reasons why the `useEffect` hook might not be working as expected. Here are some common issues and their solutions:
    1. **Missing dependency**: If you're updating state or props inside an effect, make sure to include them in the dependencies array. 
    
    ```
    jsx import { useState } from 'react';
    function MyComponent()
        { const [count, setCount] = useState(0);
         useEffect(() => { console.log('Effect ran'); }, []); // Missing dependency: count return ( <div> Count: {count} <button onClick={() => setCount(count + 1)}>Increment</button> </div> ); } // Solution: useEffect(() => { console.log('Effect ran with updated state'); }, [count]);
    ```
    
    2. **Incorrect dependency order**: If you're updating a value that's used in the effect, make sure to update it before running the effect.
    ```
    jsx import { useState } from 'react'; function MyComponent() { const [name] = useState('John'); useEffect(() => { console.log(`Hello ${name}

*/