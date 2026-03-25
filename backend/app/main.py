import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import connect_db, close_db, get_db
from app.services.csv_parser import parse_csv
from app.routers import settings, projections, players, team
from app.nhl_client import nhl_client

CSV_SEED_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "DtZ 2025-2026 NHL Fantasy Projections - Skater Projections.csv",
)


async def seed_csv_projections():
    db = get_db()
    count = await db.custom_projections.count_documents({})
    if count > 0:
        print(f"[seed] {count} projections already in DB, skipping seed")
        return

    if not os.path.exists(CSV_SEED_PATH):
        print(f"[seed] CSV not found at {CSV_SEED_PATH}, skipping")
        return

    with open(CSV_SEED_PATH, "r", encoding="utf-8-sig") as f:
        content = f.read()

    players = parse_csv(content)
    if not players:
        print("[seed] No valid players found in CSV")
        return

    from pymongo import ReplaceOne
    ops = [
        ReplaceOne({"playerId": p["playerId"]}, p, upsert=True)
        for p in players
    ]
    result = await db.custom_projections.bulk_write(ops)
    print(f"[seed] Loaded {result.upserted_count + result.modified_count} player projections ({len(players)} in CSV)")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    await seed_csv_projections()
    yield
    await nhl_client.close()
    await close_db()


app = FastAPI(
    title="Fantasy Zone - NHL Stats",
    description="NHL fantasy hockey stats and projections",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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
    db = get_db()
    count = await db.custom_projections.count_documents({})
    return {"status": "ok", "app": "Fantasy Zone", "projections_loaded": count}
