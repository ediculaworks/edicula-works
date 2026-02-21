from supabase import create_client, Client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

print(f"[DEBUG] SUPABASE_URL: {SUPABASE_URL}")
print(f"[DEBUG] SUPABASE_SERVICE_KEY: {'set' if SUPABASE_SERVICE_KEY else 'None'}")


def get_db() -> Client:
    """Retorna o cliente Supabase"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise Exception(f"Missing config: URL={SUPABASE_URL}, KEY={'set' if SUPABASE_SERVICE_KEY else 'None'}")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
