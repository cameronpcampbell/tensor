use tokio::io::{stdout, AsyncWriteExt};
use std::{path::PathBuf};

type OauthClient = oauth2::Client<oauth2::StandardErrorResponse<oauth2::basic::BasicErrorResponseType>, oauth2::StandardTokenResponse<oauth2::EmptyExtraTokenFields, oauth2::basic::BasicTokenType>, oauth2::StandardTokenIntrospectionResponse<oauth2::EmptyExtraTokenFields, oauth2::basic::BasicTokenType>, oauth2::StandardRevocableToken, oauth2::StandardErrorResponse<oauth2::RevocationErrorResponseType>, oauth2::EndpointSet, oauth2::EndpointNotSet, oauth2::EndpointNotSet, oauth2::EndpointNotSet, oauth2::EndpointSet>;

use clap::{Parser, Subcommand, crate_version};

mod utils;

mod authenticate;

mod threads;

mod app;
use app::start_app;

use crate::{utils::db::{build_db, initialize_db}};

#[derive(Clone, serde::Deserialize)]
pub struct QueryAxumCallback {
    pub code: String,
    pub state: String,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let cli = Cli::parse();

    match cli.command {
        Commands::Backend { config } => {
            start_app().await
        }

        Commands::Dev { config } => {
            tokio::spawn(async move {
                let _ = tokio::process::Command::new("sh")
                    .arg("-c")
                    .arg("bun run --cwd ../webapp dev --port 8081")
                    .spawn()
                    .expect("failed to spawn command");
            });
            
            start_app().await
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
            
            start_app().await
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