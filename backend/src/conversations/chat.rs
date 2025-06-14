use axum::{
    body::Body, http::{Response, StatusCode}, response::IntoResponse, Json
};
use guarded::guarded_unwrap;
use kalosm::language::*;
use serde::Deserialize;
use std::{time::{SystemTime, UNIX_EPOCH}};
use tokio_stream::{wrappers::ReceiverStream};
use tokio::sync::{mpsc, Mutex};

use crate::{conversations::CONVERSATIONS, utils::response::error_response};

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