use axum::{
    body::Body, http::{Response, StatusCode}, response::IntoResponse, Json
};
use guarded::guarded_unwrap;
use kalosm::language::*;
use serde::Deserialize;
use std::{collections::HashMap, sync::OnceLock, time::{SystemTime, UNIX_EPOCH}};
use tokio_stream::{wrappers::ReceiverStream};
use tokio::sync::{mpsc, Mutex};

use crate::utils::response::error_response;

static CONVERSATIONS: OnceLock<Mutex<HashMap<String, Chat<Llama>>>> = OnceLock::new();

#[derive(Deserialize)]
pub struct AIPayload {
    body: String,
    conversation_id: String,
}

#[axum::debug_handler]
pub async fn handle_conversation(
    Json(payload): Json<AIPayload>,
) -> impl IntoResponse {
    let (tx, rx) = mpsc::channel::<Result<String, std::io::Error>>(16);

    let mut conversations = CONVERSATIONS.get().unwrap().lock().await;

    let conversation = guarded_unwrap!(
        conversations.get_mut(&payload.conversation_id),
        return error_response(StatusCode::NOT_FOUND, "Invalid conversation id!")
    );

    let mut stream = conversation(&payload.body);

    tokio::spawn(async move {
        while let Some(chunk) = stream.next().await {
            if tx.send(Ok(chunk)).await.is_err() { break }
        }
    });

    let timestamp = match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(duration) => duration.as_millis().to_string(),
        Err(_) => String::from("0")
    };

    Response::builder()
        .header("Content-Type", "application/octet-stream")
        .header("X-Timestamp", timestamp)
        .body(Body::from_stream(ReceiverStream::new(rx)))
            .unwrap()
}

pub async fn initialise_conversations() {
     println!("Downloading and starting model...");
    let model = Llama::new_chat().await.unwrap();
    println!("Model ready");

    let mut conversations: HashMap<String, Chat<Llama>> = HashMap::new();
    let conversation_id = String::from("12345");
    conversations.insert(conversation_id, model.chat());

    let _ = CONVERSATIONS.set(Mutex::new(conversations));
}
