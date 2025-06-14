use std::{ops::{Deref, DerefMut}, sync::OnceLock};

use sqlx::{postgres::PgPoolOptions, Pool as SqlxPool, Postgres};

pub struct Pool(OnceLock<SqlxPool<Postgres>>);

impl Pool {
    fn get(&self) -> &sqlx::Pool<Postgres> {
        self.0.get().unwrap()
    }
}

impl<'a> Into<&'a SqlxPool<Postgres>> for &'a Pool {
    fn into(self) -> &'a sqlx::Pool<Postgres> {
        self.0.get().unwrap()
    }
}

impl Deref for Pool {
    type Target = OnceLock<SqlxPool<Postgres>>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl DerefMut for Pool {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
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
            DROP TABLE IF EXISTS users;
            DROP TABLE IF EXISTS thread;
            DROP TABLE IF EXISTS message;
        "#).execute(POOL.get()).await.unwrap();
    }

    let _  = sqlx::raw_sql(r#"
        CREATE TABLE IF NOT EXISTS users (
            id char(21) DEFAULT nanoid(21) PRIMARY KEY,
            provider_userid TEXT NOT NULL,
            provider_username TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS threads (
            id char(21) DEFAULT nanoid(21) PRIMARY KEY,
            summary VARCHAR(50) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS messages (
            id char(21) DEFAULT nanoid(21) PRIMARY KEY,
            conversation_id char(21) DEFAULT nanoid(21),
            content TEXT NOT NULL
        );
    "#).execute(POOL.get()).await.unwrap();
}