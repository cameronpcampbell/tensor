use axum::routing::{{get, post}, Router};
use std::sync::Arc;

type OauthClient = oauth2::Client<oauth2::StandardErrorResponse<oauth2::basic::BasicErrorResponseType>, oauth2::StandardTokenResponse<oauth2::EmptyExtraTokenFields, oauth2::basic::BasicTokenType>, oauth2::StandardTokenIntrospectionResponse<oauth2::EmptyExtraTokenFields, oauth2::basic::BasicTokenType>, oauth2::StandardRevocableToken, oauth2::StandardErrorResponse<oauth2::RevocationErrorResponseType>, oauth2::EndpointSet, oauth2::EndpointNotSet, oauth2::EndpointNotSet, oauth2::EndpointNotSet, oauth2::EndpointSet>;

mod utils;

mod authenticate;
use authenticate::{github_oauth_callback, github_oauth_login, initialise_github_oauth};

mod conversations;
use conversations::{handle_conversation, initialise_conversations};

#[derive(Clone, serde::Deserialize)]
pub struct QueryAxumCallback {
    pub code: String,
    pub state: String,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    initialise_conversations().await;

    let github_oauth_client = Arc::new(initialise_github_oauth().await.unwrap());
    
    let app = Router::new()
        .route("/", post(handle_conversation))
            .layer(tower_http::cors::CorsLayer::permissive())
            
        .route("/oauth/github", get(github_oauth_login))
            .with_state(github_oauth_client.clone())

        .route("/oauth/callback", get(github_oauth_callback))
            .with_state(github_oauth_client.clone());

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}
