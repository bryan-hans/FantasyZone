from app.database import get_db

DEFAULT_SKATER_SCORING = {
    "goals": 6.0,
    "assists": 4.0,
    "plus_minus": 2.0,
    "pp_points": 2.0,
    "shp": 3.0,
    "sog": 0.9,
    "hits": 0.5,
    "blk": 0.5,
    "pim": 0.5,
    "fow": 0.0,
}

DEFAULT_GOALIE_SCORING = {
    "wins": 5.0,
    "saves": 0.6,
    "goals_against": -3.0,
    "shutouts": 5.0,
    "otl": -1.0,
}

PRESET_SCORING = {
    "yahoo_default": {
        "name": "Yahoo Default",
        "skater": {
            "goals": 6.0, "assists": 4.0, "plus_minus": 2.0,
            "pp_points": 2.0, "shp": 3.0, "sog": 0.9,
            "hits": 0.5, "blk": 0.5, "pim": 0.5, "fow": 0.0,
        },
        "goalie": {
            "wins": 5.0, "saves": 0.6, "goals_against": -3.0,
            "shutouts": 5.0, "otl": -1.0,
        },
    },
    "espn_default": {
        "name": "ESPN Default",
        "skater": {
            "goals": 6.0, "assists": 4.0, "plus_minus": 2.0,
            "pp_points": 1.0, "shp": 2.0, "sog": 0.5,
            "hits": 0.5, "blk": 0.5, "pim": 0.25, "fow": 0.0,
        },
        "goalie": {
            "wins": 5.0, "saves": 0.35, "goals_against": -3.0,
            "shutouts": 5.0, "otl": -1.0,
        },
    },
    "fantrax_default": {
        "name": "Fantrax Default",
        "skater": {
            "goals": 5.0, "assists": 3.0, "plus_minus": 1.0,
            "pp_points": 1.5, "shp": 2.0, "sog": 0.4,
            "hits": 0.4, "blk": 0.4, "pim": 0.3, "fow": 0.1,
        },
        "goalie": {
            "wins": 4.0, "saves": 0.5, "goals_against": -2.5,
            "shutouts": 4.0, "otl": -1.0,
        },
    },
}


async def get_scoring_settings() -> dict:
    db = get_db()
    doc = await db.settings.find_one({"_id": "scoring"})
    if doc:
        return {
            "skater": doc.get("skater", DEFAULT_SKATER_SCORING),
            "goalie": doc.get("goalie", DEFAULT_GOALIE_SCORING),
        }
    return {"skater": DEFAULT_SKATER_SCORING, "goalie": DEFAULT_GOALIE_SCORING}


async def save_scoring_settings(skater: dict, goalie: dict):
    db = get_db()
    await db.settings.replace_one(
        {"_id": "scoring"},
        {"_id": "scoring", "skater": skater, "goalie": goalie},
        upsert=True,
    )


def calculate_skater_fp(player: dict, weights: dict) -> float:
    fp = 0.0
    fp += player.get("goals", 0) * weights.get("goals", 0)
    fp += player.get("assists", 0) * weights.get("assists", 0)
    fp += player.get("plus_minus", 0) * weights.get("plus_minus", 0)
    fp += player.get("pp_points", 0) * weights.get("pp_points", 0)
    fp += player.get("shp", 0) * weights.get("shp", 0)
    fp += player.get("sog", 0) * weights.get("sog", 0)
    fp += player.get("hits", 0) * weights.get("hits", 0)
    fp += player.get("blk", 0) * weights.get("blk", 0)
    fp += player.get("pim", 0) * weights.get("pim", 0)
    fp += player.get("fow", 0) * weights.get("fow", 0)
    return round(fp, 2)
