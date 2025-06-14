use kalosm::language::ChatModelExt;

use crate::threads::{LLAMA_MODEL, LLAMA_MODEL_CHAT};

pub async fn summary(to_summarise: &str) {
    println!(":)");

    let summary = LLAMA_MODEL_CHAT.get().unwrap()(
        &format!("Describe this in 10 words or less: \"{}\"", to_summarise)
    );
}