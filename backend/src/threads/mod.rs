mod send_message;
use std::{collections::HashMap, sync::OnceLock};

pub use send_message::*;
use kalosm::language::{Chat, ChatModelExt, Llama};
use tokio::sync::Mutex;

pub static THREADS: OnceLock<Mutex<HashMap<String, Chat<Llama>>>> = OnceLock::new();

pub async fn initialize_threads() {
    println!("Downloading and starting model...");
    let model = Llama::new_chat().await.unwrap();
    println!("Model ready");

    let mut threads: HashMap<String, Chat<Llama>> = HashMap::new();
    let thread_id = String::from("12345");
    threads.insert(thread_id, model.chat());

    let _ = THREADS.set(Mutex::new(threads));
}
