use axum::{body::Body, http::{Response, StatusCode}};

pub fn error_response(status: StatusCode, reason: &str) -> Response<Body> {
    return Response::builder()
        .status(status)
        .body(Body::new(String::from(reason)))
        .unwrap()
}