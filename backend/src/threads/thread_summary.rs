use kalosm::language::{Llama, TextCompletionBuilder};

use crate::threads::{LLAMA_MODEL, LLAMA_MODEL_CHAT};

pub fn summary(to_summarise: &str) -> TextCompletionBuilder<Llama> {
    LLAMA_MODEL_CHAT.get().unwrap()(
        &format!("Describe this in 10 words or less: \"{}\"", to_summarise)
    )
}