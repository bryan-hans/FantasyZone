import os
import sys
import traceback

print(f"[boot] Python {sys.version}")
print(f"[boot] CWD: {os.getcwd()}")

try:
    from contextlib import asynccontextmanager
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    print("[boot] FastAPI imported OK")

    from app.database import connect_db, close_db, get_db
    from app.services.csv_parser import parse_csv
    from app.routers import settings, projections, players, team
    from app.nhl_client import nhl_client
    print("[boot] All modules imported OK")
except Exception as e:
    print(f"[boot] IMPORT ERROR: {e}")
    traceback.print_exc()
    sys.exit(1)

CSV_SEED_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "DtZ 2025-2026 NHL Fantasy Projections - Skater Projections.csv",
)
print(f"[boot] CSV path: {CSV_SEED_PATH} (exists: {os.path.exists(CSV_SEED_PATH)})")


async def seed_csv_projections():
    try:
        db = get_db()
        if db is None:
            print("[seed] No database connection, skipping seed")
            return

        count = await db.custom_projections.count_documents({})
        if count > 0:
            print(f"[seed] {count} projections already in DB, skipping seed")
            return

        if not os.path.exists(CSV_SEED_PATH):
            print(f"[seed] CSV not found, skipping seed")
            return

        with open(CSV_SEED_PATH, "r", encoding="utf-8-sig") as f:
            content = f.read()

        player_data = parse_csv(content)
        if not player_data:
            print("[seed] No valid players found in CSV")
            return

        from pymongo import ReplaceOne
        ops = [
            ReplaceOne({"playerId": p["playerId"]}, p, upsert=True)
            for p in player_data
        ]
        result = await db.custom_projections.bulk_write(ops)
        print(f"[seed] Loaded {result.upserted_count + result.modified_count} projections")
    except Exception as e:
        print(f"[seed] Error: {e}")
        traceback.print_exc()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[lifespan] Starting up...")
    await connect_db()
    await seed_csv_projections()
    print("[lifespan] Startup complete")
    yield
    await nhl_client.close()
    await close_db()


app = FastAPI(
    title="Fantasy Zone - NHL Stats",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(settings.router)
app.include_router(projections.router)
app.include_router(players.router)
app.include_router(team.router)


@app.get("/api/health")
async def health():
    try:
        db = get_db()
        count = await db.custom_projections.count_documents({})
        return {"status": "ok", "app": "Fantasy Zone", "projections_loaded": count}
    except Exception:
        return {"status": "ok", "app": "Fantasy Zone", "projections_loaded": "unknown"}
