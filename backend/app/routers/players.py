from fastapi import APIRouter, Query
from typing import Optional

from app.nhl_client import nhl_client
from app.database import get_db
from app.services.scoring import get_scoring_settings, calculate_skater_fp

router = APIRouter(prefix="/api/players", tags=["players"])


@router.get("/search")
async def search_players(q: str = Query(..., min_length=1), limit: int = Query(20, le=50)):
    db = get_db()
    local_results = await db.custom_projections.find(
        {"player": {"$regex": q, "$options": "i"}},
        {"_id": 0, "playerId": 1, "player": 1, "pos": 1, "team": 1},
    ).to_list(length=limit)

    nhl_results = await nhl_client.search_players(q, limit=limit)

    return {"local": local_results, "nhl": nhl_results}


@router.get("/{player_id}")
async def get_player(player_id: int):
    landing = await nhl_client.get_player_landing(player_id)

    db = get_db()
    scoring = await get_scoring_settings()
    projection = await db.custom_projections.find_one({"playerId": player_id})
    if projection:
        projection.pop("_id", None)
        projection["fantasy_points"] = calculate_skater_fp(projection, scoring["skater"])

    return {"profile": landing, "projection": projection}


@router.get("/{player_id}/gamelog")
async def get_player_gamelog(player_id: int, season: Optional[str] = "20252026"):
    data = await nhl_client.get_player_game_log(player_id, season=season)
    if not data:
        return {"error": "Game log not found"}
    return data
