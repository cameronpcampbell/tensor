use axum::{
    body::Body, extract::State, http::Response, response::IntoResponse, routing::post, Json, Router
};
use bytes::Bytes;
use kalosm::language::*;
use serde::Deserialize;
use std::sync::{Arc, Mutex};
use tokio_stream::{wrappers::ReceiverStream};
use tokio::sync::mpsc;

#[tokio::main]
async fn main() {
    println!("Downloading and starting model...");
    let model = Mutex::new(Llama::new_chat().await.unwrap().chat());
    println!("Model ready");

    let app = Router::new()
        .route("/", post(stream_response))
        .with_state(Arc::new(model));

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[derive(Deserialize)]
struct AIPayload {
    body: String
}

async fn stream_response(
    State(model): State<Arc<Mutex<Chat<Llama>>>>,
    Json(payload): Json<AIPayload>,
) -> impl IntoResponse {
    let mut stream = model.lock().unwrap()(&payload.body);

    let (tx, rx) = mpsc::channel::<Result<Bytes, std::io::Error>>(16);

    tokio::spawn(async move {
        while let Some(chunk) = stream.next().await {
            let bytes = Bytes::from(chunk);
            if tx.send(Ok(bytes)).await.is_err() { break }
        }
    });

    Response::builder()
        .header("Content-Type", "application/octet-stream")
        .body(Body::from_stream(ReceiverStream::new(rx)))
        .unwrap()
}




