from functools import lru_cache
from pydantic import BaseModel
from dotenv import load_dotenv
from pathlib import Path
import os

load_dotenv()

class Settings(BaseModel):
    CLIENT_ID: str | None = os.getenv("CLIENT_ID")
    CLIENT_SECRET: str | None = os.getenv("CLIENT_SECRET")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
