use std::sync::OnceLock;

use jwt_simple::prelude::HS256Key;
use serde::{Deserialize, Serialize};

use crate::utils::db::ProviderType;

#[derive(Serialize, Deserialize)]
pub struct UserInfoClaims {
    pub user_id: String,
    pub provider_user_id: usize,
    pub provider_username: String,
    pub provider_avatar_url: String,
    pub provider_type: ProviderType,
}

pub static JWT_KEY: OnceLock<HS256Key> = OnceLock::new();

// A simple macro to abtract away the boilerplatiness of verifying and parsing the jwt.
#[macro_export]
macro_rules! with_jwt {
    ($cookie_jar:expr) => {{
        use guarded::guarded_unwrap;
        use jwt_simple::prelude::MACLike;
        
        let jwt = guarded::guarded_unwrap!(
            $cookie_jar.get("oauth.session"),
            return crate::utils::response::error_response(axum::http::StatusCode::BAD_REQUEST, "Missing \"oauth.session\" cookie in request!")
        ).value();

        guarded::guarded_unwrap!(
            crate::authenticate::jwt::JWT_KEY.get().unwrap().verify_token::<crate::authenticate::jwt::UserInfoClaims>(jwt, None),
            return crate::utils::response::error_response(axum::http::StatusCode::UNAUTHORIZED, "Invalid JWT!")
        ).custom
    }};
}