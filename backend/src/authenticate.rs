use std::{env, sync::Arc};

use axum::{body::Body, extract::{Query, State}, http::{Response, StatusCode}, response::IntoResponse};
use axum_extra::extract::CookieJar;
use guarded::guarded_unwrap;
use oauth2::{basic::BasicClient, reqwest, AuthUrl, AuthorizationCode, ClientId, ClientSecret, CsrfToken, PkceCodeChallenge, PkceCodeVerifier, RedirectUrl, Scope, TokenUrl};
use serde::Deserialize;

use crate::{utils::{cookie::{create_cookie, delete_cookie, CreateCookieOptions}, response::error_response}, OauthClient};


#[derive(Debug, Deserialize)]
pub struct OauthCallbackParams {
    code: String,
    state: String
}

#[axum::debug_handler]
pub async fn github_oauth_callback(
    State(client): State<Arc<OauthClient>>,
    Query(params): Query<OauthCallbackParams>,
    cookie_jar: CookieJar
) -> impl IntoResponse {
    let state_cookie = guarded_unwrap!(
        cookie_jar.get("oauth.github.state"),
        return error_response(StatusCode::BAD_REQUEST, "Missing \"oauth.github.state\" cookie in request!")
    );
    if state_cookie.http_only().is_some_and(|x| !x) {
        return error_response(StatusCode::BAD_REQUEST, "\"oauth.github.state\" header needs to be http only!")
    }
    if state_cookie.value().to_string() != params.state {
        return error_response(StatusCode::BAD_REQUEST, "State mismatch!")
    }

    let verifier_cookie = guarded_unwrap!(
        cookie_jar.get("oauth.github.verifier"),
        return error_response(StatusCode::BAD_REQUEST, "Missing \"oauth.github.verifier\" cookie in request!")
    );
    if verifier_cookie.http_only().is_some_and(|x| !x) {
        return error_response(StatusCode::BAD_REQUEST, "\"oauth.github.verifier\" header needs to be http only!")
    }

    let http_client = reqwest::ClientBuilder::new()
        // Following redirects opens the client up to SSRF vulnerabilities.
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .expect("Client should build");

    let token_result = client
        .exchange_code(AuthorizationCode::new(params.code))
        // Set the PKCE code verifier.
        .set_pkce_verifier(PkceCodeVerifier::new(verifier_cookie.value().to_string()))
        .request_async(&http_client)
        .await;
    
    Response::builder()
        .status(StatusCode::OK)
        .header("Set-Cookie", delete_cookie("verifier"))
        .header("Set-Cookie", delete_cookie("state"))
        .body(Body::new(String::from("OK!")))
            .unwrap()
}


#[axum::debug_handler]
pub async fn github_oauth_login(State(client): State<Arc<OauthClient>>) -> impl IntoResponse {
    let (pkce_challenge, verifier) = PkceCodeChallenge::new_random_sha256();

    let (auth_url, state) = client
        .authorize_url(CsrfToken::new_random)
        .add_scope(Scope::new("read".to_string()))
        .set_pkce_challenge(pkce_challenge)
        .url();

    let verifier_cookie = create_cookie(
        "oauth.github.verifier", 
        verifier.secret(), 
        CreateCookieOptions {
            secure: Some(false),
            path: Some("/"),
            http_only: Some(true),
            max_age: Some(60 * 10), // 10 minutes.
            same_site: Some("strict")
        }
    );

    let state_cookie = create_cookie(
        "oauth.github.state", 
        state.secret(), 
        CreateCookieOptions {
            secure: Some(false),
            path: Some("/"),
            http_only: Some(true),
            max_age: Some(60 * 10), // 10 minutes.
            same_site: Some("strict")
        }
    );

    Response::builder()
        .status(StatusCode::FOUND)
        .header("Location", auth_url.to_string())
        .header("Set-Cookie", verifier_cookie)
        .header("Set-Cookie", state_cookie)
        .body(Body::empty())
        .unwrap()
}


pub async fn initialise_github_oauth() -> Result<OauthClient, oauth2::url::ParseError> {
    let client_id = env::var(format!("GITHUB_CLIENT_ID")).expect("Client Id");
    let client_secret = env::var("GITHUB_CLIENT_SECRET").expect("Client Secret");

    Ok(
        BasicClient::new(ClientId::new(client_id))
            .set_client_secret(ClientSecret::new(client_secret))
            .set_auth_uri(AuthUrl::new("https://github.com/login/oauth/authorize".to_string())?)
            .set_token_uri(TokenUrl::new("https://github.com/login/oauth/access_token".to_string())?)
            // Set the URL the user will be redirected to after the authorization process.
            .set_redirect_uri(RedirectUrl::new("http://127.0.0.1:8080/oauth/callback".to_string())?)
    )
}