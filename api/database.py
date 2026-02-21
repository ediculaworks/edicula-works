from supabase import create_client, Client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")


def get_db() -> Client:
    """Retorna o cliente Supabase"""
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
