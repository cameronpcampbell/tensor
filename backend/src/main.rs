use axum::{
    body::Body, http::{Response, StatusCode}, response::IntoResponse, routing::post, Json, Router
};
use guarded::guarded_unwrap;
use kalosm::language::*;
use serde::Deserialize;
use std::{collections::HashMap, sync::OnceLock, time::{SystemTime, UNIX_EPOCH}};
use tokio_stream::{wrappers::ReceiverStream};
use tokio::sync::{mpsc, Mutex};

static CONVERSATIONS: OnceLock<Mutex<HashMap<String, Chat<Llama>>>> = OnceLock::new();

#[tokio::main]
async fn main() {
    println!("Downloading and starting model...");
    let model = Llama::new_chat().await.unwrap();
    println!("Model ready");

    let mut conversations: HashMap<String, Chat<Llama>> = HashMap::new();
    let conversation_id = String::from("12345");
    conversations.insert(conversation_id, model.chat());

    let _ = CONVERSATIONS.set(Mutex::new(conversations));
    

    let app = Router::new()
        .route("/", post(stream_response))
        .layer(tower_http::cors::CorsLayer::permissive());

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[derive(Deserialize)]
struct AIPayload {
    body: String,
    conversation_id: String,
}

#[axum::debug_handler]
async fn stream_response(
    Json(payload): Json<AIPayload>,
) -> impl IntoResponse {
    let (tx, rx) = mpsc::channel::<Result<String, std::io::Error>>(16);

    let mut conversations = CONVERSATIONS.get().unwrap().lock().await;

    let conversation = guarded_unwrap!(
        conversations.get_mut(&payload.conversation_id),
        return Response::builder()
            .status(StatusCode::NOT_FOUND)
            .body(Body::new(String::from("Invalid conversation id!")))
            .unwrap()
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




