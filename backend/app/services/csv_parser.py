import csv
import io
from typing import Optional

COLUMN_MAP = {
    "Player": "player",
    "Age": "age",
    "Pos": "pos",
    "Team": "team",
    "Salary": "salary",
    "GP": "gp",
    "Goals": "goals",
    "Assists": "assists",
    "Points": "points",
    "PPG": "ppg",
    "PPA": "ppa",
    "PP Points": "pp_points",
    "SHG": "shg",
    "SHA": "sha",
    "SHP": "shp",
    "Hits": "hits",
    "BLK": "blk",
    "PIM": "pim",
    "FOW": "fow",
    "FOL": "fol",
    "SOG": "sog",
    '"+/-"': "plus_minus",
    "+/-": "plus_minus",
    "TOI ES": "toi_es",
    "TOI PP": "toi_pp",
    "TOI PK": "toi_pk",
    "Total TOI": "total_toi",
    "VOR": "vor",
    "Rank": "rank",
    "Unadj VOR": "unadj_vor",
    "FP Unadj": "fp_unadj",
    "PlayerId": "playerId",
    "Fantasy Team": "fantasy_team",
}

INT_FIELDS = {
    "age", "gp", "goals", "assists", "points", "ppg", "ppa", "pp_points",
    "shg", "sha", "shp", "hits", "blk", "pim", "fow", "fol", "sog",
    "plus_minus", "rank",
}
FLOAT_FIELDS = {"toi_es", "toi_pp", "toi_pk", "total_toi", "vor", "unadj_vor", "fp_unadj"}


def _safe_int(val: str) -> int:
    if not val or val.strip() == "":
        return 0
    try:
        return int(float(val.strip().replace(",", "")))
    except (ValueError, TypeError):
        return 0


def _safe_float(val: str) -> float:
    if not val or val.strip() == "":
        return 0.0
    try:
        return float(val.strip().replace(",", ""))
    except (ValueError, TypeError):
        return 0.0


def parse_csv(content: str) -> list[dict]:
    reader = csv.DictReader(io.StringIO(content))
    players = []

    for row in reader:
        doc = {}
        for csv_col, field_name in COLUMN_MAP.items():
            raw = row.get(csv_col, "")
            if raw is None:
                raw = ""

            if field_name == "playerId":
                val = _safe_int(raw)
                if not val:
                    break
                doc[field_name] = val
            elif field_name in INT_FIELDS:
                doc[field_name] = _safe_int(raw)
            elif field_name in FLOAT_FIELDS:
                doc[field_name] = _safe_float(raw)
            else:
                doc[field_name] = raw.strip() if isinstance(raw, str) else raw

        if "playerId" in doc and doc["playerId"]:
            doc["source"] = "csv"
            players.append(doc)

    return players
