from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "fantasy_zone"
    current_season: str = "20252026"

    class Config:
        env_file = ".env"


settings = Settings()
