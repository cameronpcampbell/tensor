use axum::{
    body::Body, extract::Path, http::{Response, StatusCode}, response::IntoResponse
};
use guarded::guarded_unwrap;
use serde::Deserialize;
use std::{time::{SystemTime, UNIX_EPOCH}};

use crate::{threads::{summary, THREADS}, utils::{response::error_response, stream_to_channel::StreamToChannel}};

#[axum::debug_handler]
pub async fn send_message(
    Path(thread_id): Path<String>,
    payload: String,
) -> impl IntoResponse {
    println!("{}", payload);

    let timestamp = match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(duration) => duration.as_millis().to_string(),
        Err(_) => String::from("0")
    };

    let mut threads = THREADS.get().unwrap().lock().await;

    let thread = guarded_unwrap!(
        threads.get_mut(&thread_id),
        return error_response(StatusCode::NOT_FOUND, "Invalid thread id!")
    );

    Response::builder()
        .header("Content-Type", "application/octet-stream")
        .header("X-Timestamp", timestamp)
        .body( StreamToChannel::new(thread(&payload)).into() )
            .unwrap()
}