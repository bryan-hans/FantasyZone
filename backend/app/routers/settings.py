from fastapi import APIRouter
from pydantic import BaseModel

from app.services.scoring import (
    get_scoring_settings,
    save_scoring_settings,
    PRESET_SCORING,
)

router = APIRouter(prefix="/api/settings", tags=["settings"])


class ScoringBody(BaseModel):
    skater: dict[str, float]
    goalie: dict[str, float]


@router.get("/scoring")
async def get_scoring():
    return await get_scoring_settings()


@router.put("/scoring")
async def update_scoring(body: ScoringBody):
    await save_scoring_settings(body.skater, body.goalie)
    return {"message": "Scoring settings updated"}


@router.get("/scoring/presets")
async def get_presets():
    return PRESET_SCORING
