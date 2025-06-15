use axum::{http::StatusCode, response::Response};
use axum_extra::extract::CookieJar;
use guarded::guarded_unwrap;
use jwt_simple::prelude::MACLike;
use kalosm::language::ChatModelExt;

use crate::{authenticate::jwt::{UserInfoClaims, JWT_KEY}, threads::{LLAMA_MODEL_CHAT, THREADS}, utils::{db::create_thread_in_db, response::{error_response, internal_error_response}, stream_to_channel::StreamToChannel, timestamp::timestamp_now}, with_jwt};

pub async fn new_thread(
    cookie_jar: CookieJar,
    payload: String
) -> Response {
    let timestamp = timestamp_now().to_string();

    let claims = with_jwt!(cookie_jar);

    let user_id = claims.user_id;

    let thread_id = guarded_unwrap!(
        create_thread_in_db(&user_id, false, "Untitled Thread", None).await,
        return internal_error_response()
    );

    let threads = THREADS.get().unwrap();
    
    threads.insert(thread_id.clone(), LLAMA_MODEL_CHAT.get().unwrap().chat());
    let mut chat = threads.get_mut(&thread_id).unwrap();

    Response::builder()
        .header("Content-Type", "application/octet-stream")
        .header("X-Timestamp", timestamp)
        .body( StreamToChannel::new(chat.value_mut()(&payload)).into() )
            .unwrap()
}