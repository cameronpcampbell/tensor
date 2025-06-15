use std::{sync::OnceLock};
use dashmap::DashMap;
use kalosm::language::{Chat, Llama};

mod send_message;
pub use send_message::*;

mod new_thread;
pub use new_thread::*;

mod thread_summary;
pub use thread_summary::*;

mod get_threads;
pub use get_threads::*;

pub static THREADS: OnceLock<DashMap<String, Chat<Llama>>> = OnceLock::new();

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

            let _ = THREADS.set(DashMap::new());
        })
    );
}
