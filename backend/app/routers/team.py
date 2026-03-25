from fastapi import APIRouter
from pydantic import BaseModel

from app.database import get_db
from app.services.scoring import get_scoring_settings, calculate_skater_fp

router = APIRouter(prefix="/api/team", tags=["team"])


class AddPlayerBody(BaseModel):
    playerId: int


@router.get("")
async def get_team():
    db = get_db()
    scoring = await get_scoring_settings()
    weights = scoring["skater"]

    roster_doc = await db.my_team.find_one({"_id": "roster"})
    player_ids = roster_doc.get("player_ids", []) if roster_doc else []

    if not player_ids:
        return {"players": [], "totals": _empty_totals()}

    players = []
    for pid in player_ids:
        proj = await db.custom_projections.find_one({"playerId": pid})
        if proj:
            proj.pop("_id", None)
            proj["fantasy_points"] = calculate_skater_fp(proj, weights)
            proj["fp_per_game"] = round(proj["fantasy_points"] / proj["gp"], 2) if proj.get("gp", 0) > 0 else 0
            players.append(proj)

    totals = _aggregate_totals(players)
    return {"players": players, "totals": totals}


@router.post("/add")
async def add_player(body: AddPlayerBody):
    db = get_db()

    proj = await db.custom_projections.find_one({"playerId": body.playerId})
    if not proj:
        return {"error": "Player not found in projections"}

    await db.my_team.update_one(
        {"_id": "roster"},
        {"$addToSet": {"player_ids": body.playerId}},
        upsert=True,
    )
    return {"message": f"Added player {body.playerId} to team"}


@router.delete("/{player_id}")
async def remove_player(player_id: int):
    db = get_db()
    await db.my_team.update_one(
        {"_id": "roster"},
        {"$pull": {"player_ids": player_id}},
    )
    return {"message": f"Removed player {player_id} from team"}


@router.delete("")
async def clear_team():
    db = get_db()
    await db.my_team.replace_one({"_id": "roster"}, {"_id": "roster", "player_ids": []}, upsert=True)
    return {"message": "Team cleared"}


STAT_KEYS = ["gp", "goals", "assists", "points", "pp_points", "shp", "sog",
             "hits", "blk", "pim", "fow", "plus_minus"]


def _aggregate_totals(players: list[dict]) -> dict:
    totals: dict = {}
    for key in STAT_KEYS:
        totals[key] = sum(p.get(key, 0) for p in players)
    totals["fantasy_points"] = round(sum(p.get("fantasy_points", 0) for p in players), 2)
    totals["player_count"] = len(players)
    return totals


def _empty_totals() -> dict:
    totals = {key: 0 for key in STAT_KEYS}
    totals["fantasy_points"] = 0
    totals["player_count"] = 0
    return totals
