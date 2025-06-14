use axum::{
    body::Body, http::{Response, StatusCode}, response::IntoResponse, Json
};
use guarded::guarded_unwrap;
use kalosm::language::*;
use serde::Deserialize;
use std::{time::{SystemTime, UNIX_EPOCH}};
use tokio_stream::{wrappers::ReceiverStream};
use tokio::sync::mpsc;

use crate::{threads::THREADS, utils::response::error_response};

#[derive(Deserialize)]
pub struct AIPayload {
    body: String,
    thread_id: String,
}

#[axum::debug_handler]
pub async fn handle_thread(
    Json(payload): Json<AIPayload>,
) -> impl IntoResponse {
    let (tx, rx) = mpsc::channel::<Result<String, std::io::Error>>(16);

    let mut threads = THREADS.get().unwrap().lock().await;

    let thread = guarded_unwrap!(
        threads.get_mut(&payload.thread_id),
        return error_response(StatusCode::NOT_FOUND, "Invalid thread id!")
    );

    let mut stream = thread(&payload.body);

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