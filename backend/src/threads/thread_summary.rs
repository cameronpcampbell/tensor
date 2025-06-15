use axum::{response:: Response};
use axum_extra::extract::CookieJar;
use crate::{threads::LLAMA_MODEL_CHAT, utils::stream_to_channel::StreamToChannel, with_jwt};

pub async fn thread_summary(
    cookie_jar: CookieJar,
    payload: String
) -> Response {
    with_jwt!(cookie_jar);

    let summary = LLAMA_MODEL_CHAT.get().unwrap()(
        &format!("Describe this in 10 words or less: \"{}\"", payload)
    );

     Response::builder()
        .header("Content-Type", "application/octet-stream")
        .body(StreamToChannel::new(summary).into())
            .unwrap()
}