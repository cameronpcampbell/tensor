mod chat;
use std::{collections::HashMap, sync::{OnceLock}};

pub use chat::*;
use kalosm::language::{Chat, Llama, ChatModelExt};
use tokio::sync::Mutex;

pub static CONVERSATIONS: OnceLock<Mutex<HashMap<String, Chat<Llama>>>> = OnceLock::new();

pub async fn initialise_conversations() {
    println!("Downloading and starting model...");
    let model = Llama::new_chat().await.unwrap();
    println!("Model ready");

    let mut conversations: HashMap<String, Chat<Llama>> = HashMap::new();
    let conversation_id = String::from("12345");
    conversations.insert(conversation_id, model.chat());

    let _ = CONVERSATIONS.set(Mutex::new(conversations));
}
