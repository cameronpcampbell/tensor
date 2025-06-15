use axum::{
    extract::Path, http::{StatusCode}, response::Response
};
use axum_extra::extract::CookieJar;
use guarded::guarded_unwrap;

use crate::{threads::THREADS, utils::{response::error_response, stream_to_channel::StreamToChannel, timestamp::timestamp_now}, with_jwt};

#[axum::debug_handler]
pub async fn send_message(
    Path(thread_id): Path<String>,
    cookie_jar: CookieJar,
    payload: String
) -> Response {
    let timestamp = timestamp_now().to_string();

    let claims = with_jwt!(cookie_jar);

    let threads = THREADS.get().unwrap();

    let mut chat = guarded_unwrap!(
        threads.get_mut(&thread_id),
        return error_response(StatusCode::NOT_FOUND, "Invalid thread id!")
    );

    Response::builder()
        .header("Content-Type", "application/octet-stream")
        .header("X-Timestamp", timestamp)
        .body(StreamToChannel::new(chat.value_mut()(&payload)).into())
            .unwrap()
}