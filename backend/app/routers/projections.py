from fastapi import APIRouter, Query, UploadFile, File
from typing import Optional

from app.database import get_db
from app.services.scoring import get_scoring_settings, calculate_skater_fp
from app.services.csv_parser import parse_csv

router = APIRouter(prefix="/api/projections", tags=["projections"])


@router.get("")
async def list_projections(
    position: Optional[str] = Query(None, description="Filter by position (C, LW, RW, D) -- comma-separated for multiple"),
    sort_by: str = Query("fantasy_points", description="Field to sort by"),
    limit: int = Query(200, le=1000),
    offset: int = Query(0, ge=0),
    search: Optional[str] = Query(None, description="Search player name"),
):
    db = get_db()
    scoring = await get_scoring_settings()
    weights = scoring["skater"]

    query = {}
    if position:
        positions = [p.strip().upper() for p in position.split(",")]
        query["pos"] = {"$regex": "|".join(positions), "$options": "i"}
    if search:
        query["player"] = {"$regex": search, "$options": "i"}

    cursor = db.custom_projections.find(query)
    all_players = await cursor.to_list(length=None)

    for p in all_players:
        p["fantasy_points"] = calculate_skater_fp(p, weights)
        p["fp_per_game"] = round(p["fantasy_points"] / p["gp"], 2) if p.get("gp", 0) > 0 else 0
        p.pop("_id", None)

    reverse = sort_by not in ("rank",)
    all_players.sort(key=lambda x: x.get(sort_by, 0) or 0, reverse=reverse)

    total = len(all_players)
    paginated = all_players[offset: offset + limit]

    return {"total": total, "players": paginated}


@router.get("/{player_id}")
async def get_projection(player_id: int):
    db = get_db()
    scoring = await get_scoring_settings()
    weights = scoring["skater"]

    proj = await db.custom_projections.find_one({"playerId": player_id})
    if not proj:
        return {"error": "No projection found for this player"}

    proj["fantasy_points"] = calculate_skater_fp(proj, weights)
    proj["fp_per_game"] = round(proj["fantasy_points"] / proj["gp"], 2) if proj.get("gp", 0) > 0 else 0
    proj.pop("_id", None)
    return proj


@router.post("/upload")
async def upload_projections(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8-sig")
    players = parse_csv(text)

    if not players:
        return {"error": "No valid player data found in CSV"}

    db = get_db()
    await db.custom_projections.delete_many({})

    from pymongo import ReplaceOne
    ops = [ReplaceOne({"playerId": p["playerId"]}, p, upsert=True) for p in players]
    result = await db.custom_projections.bulk_write(ops)

    return {
        "message": f"Uploaded {result.upserted_count} player projections",
        "count": result.upserted_count,
    }
