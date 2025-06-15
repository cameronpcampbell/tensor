use axum::routing::{{get, post}, Router};
use std::{sync::Arc};

use crate::{authenticate::{github_oauth_callback, github_oauth_login, initialize_github_oauth}, threads::{initialize_threads, new_thread, send_message}, utils::db::initialize_db};

pub async fn start_app() {
    // The database needs to be initialized before everything else.
    initialize_db().await;
    
    // Threads also need to be initialized before everything 
    // else, but after the database though.
    initialize_threads().await;

    let github_oauth_client = Arc::new(initialize_github_oauth().await.unwrap());

    let app = Router::new()
        .route("/thread/chat/{thread_id}", post(send_message))
            .layer(tower_http::cors::CorsLayer::permissive())

        .route("/thread/new", post(new_thread))
            
        .route("/oauth/github", get(github_oauth_login))
            .with_state(github_oauth_client.clone())

        .route("/oauth/callback", get(github_oauth_callback))
            .with_state(github_oauth_client.clone());

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}