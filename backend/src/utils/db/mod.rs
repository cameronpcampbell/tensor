use std::{ops::{Deref, DerefMut}, sync::OnceLock};

use sqlx::{postgres::PgPoolOptions, Pool as SqlxPool, Postgres};

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
            DROP TABLE IF EXISTS messages;
            DROP TABLE IF EXISTS models;
            DROP TABLE IF EXISTS threads;
            DROP TABLE IF EXISTS users;
        "#).execute(POOL.get()).await.unwrap();
    }

    let _  = sqlx::raw_sql(r#"
        DO $$ BEGIN
            CREATE TYPE sender_type AS ENUM ('user', 'model');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        CREATE TABLE IF NOT EXISTS users (
            id char(21) DEFAULT nanoid(21) PRIMARY KEY,
            provider_userid TEXT NOT NULL,
            provider_username TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS threads (
            id char(21) DEFAULT nanoid(21) PRIMARY KEY,
            pinned bool NOT NULL,
            summary VARCHAR(50) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS models (
            id char(21) DEFAULT nanoid(21) PRIMARY KEY,
            name VARCHAR(50) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS messages (
            id char(21) DEFAULT nanoid(21) PRIMARY KEY,
            thread_id char(21) DEFAULT nanoid(21),
            content TEXT NOT NULL,
            user_id char(21) NOT NULL,
            model_id char(21) NOT NULL,
            sender_type sender_type NOT NULL,

            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
        );
    "#).execute(POOL.get()).await.unwrap();
}