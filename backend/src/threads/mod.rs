use std::{collections::HashMap, sync::OnceLock};

use kalosm::language::{Chat, ChatModelExt, Llama};
use tokio::sync::Mutex;

mod send_message;
pub use send_message::*;

mod new_thread;
pub use send_message::*;

mod thread_summary;
pub use thread_summary::*;

pub static THREADS: OnceLock<Mutex<HashMap<String, Chat<Llama>>>> = OnceLock::new();

pub static LLAMA_MODEL: OnceLock<Llama> = OnceLock::new();

pub static LLAMA_MODEL_CHAT: OnceLock<Llama> = OnceLock::new();

pub async fn initialize_threads() {
    let _ = tokio::join!(
        /*tokio::spawn(async {
            println!("Downloading and starting LLama model...");
            let model = Llama::new().await.unwrap();
            println!("LLama Model ready");

            let _ = LLAMA_MODEL.set(model);

            summary("I need help with useEffect in react!").await
        }),*/

        tokio::spawn(async {
            println!("Downloading and starting LLama Chat model...");
            let model = Llama::new_chat().await.unwrap();
            println!("LLama Chat Model ready");

            let _ = LLAMA_MODEL_CHAT.set(model);

            let mut threads: HashMap<String, Chat<Llama>> = HashMap::new();
            let thread_id = String::from("12345");
            threads.insert(thread_id, LLAMA_MODEL_CHAT.get().unwrap().chat());

            let _ = THREADS.set(Mutex::new(threads));

            summary("I need help with useEffect in react!").await
        })
    );
}
