use axum::routing::{{get, post}, Router};
use tokio::io::{stdout, AsyncWriteExt};
use std::{path::PathBuf, sync::Arc};

type OauthClient = oauth2::Client<oauth2::StandardErrorResponse<oauth2::basic::BasicErrorResponseType>, oauth2::StandardTokenResponse<oauth2::EmptyExtraTokenFields, oauth2::basic::BasicTokenType>, oauth2::StandardTokenIntrospectionResponse<oauth2::EmptyExtraTokenFields, oauth2::basic::BasicTokenType>, oauth2::StandardRevocableToken, oauth2::StandardErrorResponse<oauth2::RevocationErrorResponseType>, oauth2::EndpointSet, oauth2::EndpointNotSet, oauth2::EndpointNotSet, oauth2::EndpointNotSet, oauth2::EndpointSet>;

use clap::{Parser, Subcommand, crate_version};

mod utils;

mod authenticate;
use authenticate::{github_oauth_callback, github_oauth_login, initialize_github_oauth};

mod threads;
use threads::{handle_thread, initialize_threads};

use crate::utils::db::{build_db, initialize_db};

#[derive(Clone, serde::Deserialize)]
pub struct QueryAxumCallback {
    pub code: String,
    pub state: String,
}

async fn start() {
    // The database needs to be initialized before everything else.
    initialize_db().await;

    initialize_threads().await;

    let github_oauth_client = Arc::new(initialize_github_oauth().await.unwrap());
    
    let app = Router::new()
        .route("/", post(handle_thread))
            .layer(tower_http::cors::CorsLayer::permissive())
            
        .route("/oauth/github", get(github_oauth_login))
            .with_state(github_oauth_client.clone())

        .route("/oauth/callback", get(github_oauth_callback))
            .with_state(github_oauth_client.clone());

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let cli = Cli::parse();

    match cli.command {
        Commands::Backend { config } => {
            start().await
        }

        Commands::Dev { config } => {
            tokio::spawn(async move {
                let _ = tokio::process::Command::new("sh")
                    .arg("-c")
                    .arg("bun run --cwd ../webapp dev --port 8081")
                    .spawn()
                    .expect("failed to spawn command");
            });
            
            start().await
        },

        Commands::Build { config } => {
            tokio::spawn(async move {
                let _ = tokio::process::Command::new("sh")
                    .arg("-c")
                    .arg("bun run --cwd ../webapp build")
                    .spawn()
                    .expect("failed to spawn command");
            });
        },

        Commands::Start { config } => {
            tokio::spawn(async move {
                let _ = tokio::process::Command::new("sh")
                    .arg("-c")
                    .arg("bun run --cwd ../webapp start --port 8081")
                    .spawn()
                    .expect("failed to spawn command");
            });
            
            start().await
        },

        Commands::Database(subcommand) => match subcommand {
            DatabaseCommands::Build { with_deletion } => {
                // We need to make sure our database is
                // initialized before we use it
                initialize_db().await;
                build_db(with_deletion).await;
            }
        },

        Commands::Version => {
            let mut stdout = stdout();
            let _ = stdout.write_all(
                &format!("Tensor Version: v{}", crate_version!()).as_bytes()
            ).await;
        }
    }
}


#[derive(Parser)]
#[command(name = "CLI")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Backend {
        #[arg(short, long)]
        config: Option<PathBuf>,
    },

    Dev {
        #[arg(short, long)]
        config: Option<PathBuf>,
    },

    Build {
        #[arg(short, long)]
        config: Option<PathBuf>,
    },

    Start {
        #[arg(short, long)]
        config: Option<PathBuf>,
    },

    #[command(subcommand, name="db")]
    Database(DatabaseCommands),

    Version
}

#[derive(Subcommand)]
enum DatabaseCommands {
    Build {
        #[clap(long = "delete", short = 'd')]
        with_deletion: bool
    },
}