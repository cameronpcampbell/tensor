use kalosm::language::Bert;

use crate::utils::db::POOL;

pub async fn new_thread(initial_msg: &str) {
    /*let result = sqlx::query(r#"
        INSERT INTO threads (pinned, summary)
        VALUES (false, $1)
        RETURNING id;
    "#)
        .bind(summary)
        .execute(POOL.get())
        .await;

    println!("{:#?}", result);*/
}