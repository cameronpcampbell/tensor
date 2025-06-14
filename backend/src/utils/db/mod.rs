use std::{fs, ops::{Deref, DerefMut}, sync::OnceLock};

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

async fn initialise_db() {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&std::env::var("POSTGRES_URL").unwrap())
        .await
        .unwrap();

    let _ = POOL.set(pool);
}

async fn build_db() {
    // Loads nanoid (a UUID module).
    let nanoid_sql = fs::read_to_string("path/to/file.sql").unwrap();
    let _ = sqlx::query(&nanoid_sql).execute(POOL.get()).await;

    let _  = sqlx::query(r#"
        CREATE TABLE IF NOT EXISTS users (
            id char(21) DEFAULT nanoid(21) PRIMARY KEY,
            id_for_provider TEXT NOT NULL,
            provider_name TEXT NOT NULL,
        );

        CREATE TABLE IF NOT EXISTS thread (
            id char(21) DEFAULT nanoid(21) PRIMARY KEY,
            summary TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS message (
            id char(21) DEFAULT nanoid(21) PRIMARY KEY,
            conversation_id char(21) DEFAULT nanoid(21),
            content TEXT NOT NULL,
        );
    "#).execute(POOL.get()).await;
}