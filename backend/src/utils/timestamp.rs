use std::time::{SystemTime, UNIX_EPOCH};

pub fn timestamp_now() -> u128 {
    match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(duration) => duration.as_millis(),
        Err(_) => 0
    }
}