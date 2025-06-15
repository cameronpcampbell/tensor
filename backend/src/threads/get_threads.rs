/*use axum::{body::Body, http::StatusCode, response::Response};
use axum_extra::extract::CookieJar;
use guarded::guarded_unwrap;
use jwt_simple::prelude::MACLike;
use kalosm::language::ChatModelExt;

use crate::{authenticate::jwt::{UserInfoClaims, JWT_KEY}, threads::{LLAMA_MODEL_CHAT, THREADS}, utils::{db::create_thread_in_db, response::{error_response, internal_error_response}, stream_to_channel::StreamToChannel, timestamp::timestamp_now}};

pub async fn get_threads(
    cookie_jar: CookieJar,
    timestamp: u128
) -> Response {
    let timestamp = timestamp_now().to_string();

    let jwt = guarded_unwrap!(
        cookie_jar.get("oauth.session"),
        return error_response(StatusCode::BAD_REQUEST, "Missing \"oauth.session\" cookie in request!")
    ).value();

    let claims = guarded_unwrap!(
        JWT_KEY.get().unwrap().verify_token::<UserInfoClaims>(jwt, None),
        return error_response(StatusCode::UNAUTHORIZED, "Invalid JWT!")
    ).custom;
}*/