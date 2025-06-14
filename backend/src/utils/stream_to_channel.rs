use std::ops::{Deref, DerefMut};

use axum::body::Body;
use bytes::Bytes;
use futures_core::{Stream};
use kalosm::language::StreamExt;
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;

pub struct StreamToChannel<S>
where
    S: StreamExt + Send + Unpin + 'static,
    S::Item: Send + 'static 
{
    inner: ReceiverStream<Result<S::Item, std::io::Error>>,
}

impl<S> StreamToChannel<S>
where
    S: StreamExt + Send + Unpin + 'static,
    S::Item: Send + 'static
{
    pub fn new(mut stream: S) -> Self {
        let (tx, rx) = mpsc::channel::<Result<<S as Stream>::Item, std::io::Error>>(512);

        tokio::spawn(async move {
            while let Some(chunk) = stream.next().await {
                if tx.send(Ok(chunk)).await.is_err() { break }
            }
        });

        StreamToChannel { inner: ReceiverStream::new(rx) }
    }
}

impl<S> Into<ReceiverStream<Result<S::Item, std::io::Error>>> for StreamToChannel<S>
where
    S: StreamExt + Send + Unpin + 'static,
    S::Item: Send + 'static,
    Bytes: From<S::Item>
{
    fn into(self) -> ReceiverStream<Result<S::Item, std::io::Error>> {
        self.inner
    }
}

impl<S> Into<Body> for StreamToChannel<S>
where
    S: StreamExt + Send + Unpin + 'static,
    S::Item: Send + 'static,
    Bytes: From<S::Item>
{
    fn into(self) -> Body {
        Body::from_stream(self.inner)
    }
}

impl<S> Deref for StreamToChannel<S>
where
    S: StreamExt + Send + Unpin + 'static,
    S::Item: Send + 'static 
{
    type Target = ReceiverStream<Result<S::Item, std::io::Error>>;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl<S> DerefMut for StreamToChannel<S>
where
    S: StreamExt + Send + Unpin + 'static,
    S::Item: Send + 'static 
{
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.inner
    }
}