from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "daathwi.jpg API"
    database_url: str = (
        "postgresql+psycopg2://portfolio:portfolio@127.0.0.1:5433/portfolio"
    )
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    # Match any localhost port in dev (Next.js may use 3001, 3002, …).
    cors_origin_regex: str = r"https?://(localhost|127\.0\.0\.1)(:\d+)?"
    upload_dir: str = "uploads"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
