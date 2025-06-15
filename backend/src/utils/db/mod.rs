use std::{fmt::Display, sync::OnceLock};
use serde::{Deserialize, Serialize};
use sqlx::{postgres::PgPoolOptions, Acquire, PgConnection, Pool as SqlxPool, Postgres, Row};
use crate::utils::timestamp::{timestamp_now};

pub struct Pool(OnceLock<SqlxPool<Postgres>>);

impl Pool {
    pub fn get(&self) -> &sqlx::Pool<Postgres> {
        self.0.get().unwrap()
    }

    pub fn set(&self, pool: SqlxPool<Postgres>) -> Result<(), SqlxPool<Postgres>> {
        self.0.set(pool)
    }
}

impl<'a> Into<&'a SqlxPool<Postgres>> for &'a Pool {
    fn into(self) -> &'a sqlx::Pool<Postgres> {
        self.0.get().unwrap()
    }
}

pub static POOL: Pool = Pool(OnceLock::new());

const NANOID_SRC: &str = include_str!("./nanoid.sql");

pub async fn initialize_db() {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&std::env::var("POSTGRES_URL").unwrap())
        .await
        .unwrap();

    let _ = POOL.set(pool);
}

pub async fn build_db(with_deletion: bool) {
    // Loads nanoid (a UUID module).
    let _ = sqlx::raw_sql(&NANOID_SRC).execute(POOL.get()).await;

    if with_deletion {
        let _  = sqlx::raw_sql(r#"
            DROP TABLE IF EXISTS user_messages;
            DROP TABLE IF EXISTS model_messages;
            DROP TABLE IF EXISTS threads;
            DROP TABLE IF EXISTS user_providers;
            DROP TABLE IF EXISTS users;
            DROP TABLE IF EXISTS models;
        "#).execute(POOL.get()).await.unwrap();
    }

    let _  = sqlx::raw_sql(r#"
        DO $$ BEGIN
            CREATE TYPE provider_type AS ENUM ('github');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        CREATE TABLE IF NOT EXISTS users (
            id char(21) DEFAULT nanoid(21) PRIMARY KEY
        );

        CREATE TABLE IF NOT EXISTS user_providers (
            user_id char(21) NOT NULL,
            provider_id TEXT NOT NULL,
            provider_type provider_type NOT NULL,

            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

            UNIQUE(user_id, provider_type),   -- user can have one provider of each type
            UNIQUE(provider_id, provider_type) -- no duplicate provider accounts
        );

        CREATE TABLE IF NOT EXISTS threads (
            id char(21) DEFAULT nanoid(21) PRIMARY KEY,
            author_id char(21) NOT NULL,
            pinned bool NOT NULL,
            summary VARCHAR(50) NOT NULL,

            FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS models (
            id char(21) DEFAULT nanoid(21) PRIMARY KEY,
            name VARCHAR(50) NOT NULL
        );

        DO $$ BEGIN
            CREATE TYPE sender_type AS ENUM ('user', 'model');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        CREATE TABLE IF NOT EXISTS user_messages (
            id char(21) DEFAULT nanoid(21) PRIMARY KEY,
            thread_id char(21) NOT NULL,
            content TEXT NOT NULL,
            timestamp BIGINT NOT NULL,

            FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS model_messages (
            id char(21) DEFAULT nanoid(21) PRIMARY KEY,
            thread_id char(21) NOT NULL,
            author_id char(21) NOT NULL,
            content TEXT NOT NULL,
            timestamp BIGINT NOT NULL,

            FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
            FOREIGN KEY (author_id) REFERENCES models(id) ON DELETE CASCADE
        );
    "#).execute(POOL.get()).await.unwrap();


    /*let user_id = create_user_in_db(None).await.unwrap();

    let model_id = create_model_in_db("Llama 3.1 (8B)", None).await.unwrap();

    let thread_id = create_thread_in_db(
        &user_id, false, "Untitled Thread", None
    ).await.unwrap();

    let user_message_id = create_user_message_in_db(
        &thread_id, "Hello world", None, None
    ).await.unwrap();

    let model_message_id = create_model_message_in_db(
        &thread_id, &model_id, "Hello world", None, None
    ).await.unwrap();*/

}

#[derive(Serialize, Deserialize)]
pub enum ProviderType {
    #[serde(rename = "github")]
    Github
}

impl ProviderType {
    pub fn as_str(&self) -> &str {
        match self {
            ProviderType::Github => "github",
        }
    }
}

pub async fn create_user_in_db(
    ext: Option<String>
) -> Result<String, sqlx::Error> {
    let user_row = sqlx::query(&format!(r#"
        INSERT INTO users DEFAULT VALUES
        {}
        RETURNING id
    "#, option_to_string(ext)))
        .fetch_one(POOL.get()).await?;

    Ok(user_row.get::<String, _>(0))
}

pub async fn create_user_provider_in_db(
    user_id: &str,
    provider_id: &str,
    provider_type: ProviderType,
    ext: Option<String>
) -> Result<(), sqlx::Error> {
    let user_row = sqlx::query(&format!(r#"
        INSERT INTO user_providers (user_id, provider_id, provider_type)
        VALUES ($1, $2, $3 :: provider_type)
        {}
    "#, option_to_string(ext)))
        .bind(user_id)
        .bind(provider_id)
        .bind(provider_type.as_str())
        .execute(POOL.get()).await?;

    Ok(())
}

pub async fn create_model_in_db(
    name: &str,
    ext: Option<String>
) -> Result<String, sqlx::Error> {
    let model_row = sqlx::query(&format!(r#"
        INSERT INTO models (name)
        VALUES ($1)
        {}
        RETURNING id
    "#, option_to_string(ext)))
        .bind(name)
        .fetch_one(POOL.get()).await?;

    Ok(model_row.get::<String, _>(0))
}

pub async fn create_thread_in_db(
    author_id: &str,
    pinned: bool,
    summary: &str,
    ext: Option<String>
) -> Result<String, sqlx::Error> {
    let thread_row = sqlx::query(&format!(r#"
        INSERT INTO threads (author_id, pinned, summary)
        VALUES ($1, $2, $3)
        {}
        RETURNING id
    "#, option_to_string(ext)))
        .bind(author_id)
        .bind(pinned)
        .bind(summary)
        .fetch_one(POOL.get()).await?;

    Ok(thread_row.get::<String, _>(0))
}

pub async fn create_user_message_in_db(
    thread_id: &str,
    content: &str,
    timestamp: Option<u128>,
    ext: Option<String>
) -> Result<String, sqlx::Error> {
    let user_message_row = sqlx::query(&format!(r#"
        INSERT INTO user_messages (thread_id, content, timestamp)
        VALUES ($1, $2, $3 :: BIGINT)
        {}
        RETURNING id
    "#, option_to_string(ext)))
        .bind(thread_id)
        .bind(content)
        .bind(
            timestamp.unwrap_or_else(|| timestamp_now()).to_string()
        )
        .fetch_one(POOL.get()).await?;

    Ok(user_message_row.get::<String, _>(0))
}

pub async fn create_model_message_in_db(
    thread_id: &str,
    author_id: &str,
    content: &str,
    timestamp: Option<u128>,
    ext: Option<String>
) -> Result<String, sqlx::Error> {
    let model_message_row = sqlx::query(&format!(r#"
        INSERT INTO model_messages (thread_id, author_id, content, timestamp)
        VALUES ($1, $2, $3, $4 :: BIGINT)
        {}
        RETURNING id
    "#, option_to_string(ext)))
        .bind(thread_id)
        .bind(author_id)
        .bind(content)
        .bind(
            timestamp.unwrap_or_else(|| timestamp_now()).to_string()
        )
        .fetch_one(POOL.get()).await?;

    Ok(model_message_row.get::<String, _>(0))
}

fn option_to_string(option: Option<String>) -> String {
    match option {
        Some(t) => t.to_string(),
        None => String::new()
    }
}