import httpx
from typing import Optional

NHL_API_BASE = "https://api-web.nhle.com/v1"
NHL_SEARCH_BASE = "https://search.d3.nhle.com/api/v1"


class NHLClient:
    def __init__(self):
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=15.0)
        return self._client

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def search_players(self, query: str, limit: int = 20) -> list[dict]:
        client = await self._get_client()
        url = f"{NHL_SEARCH_BASE}/search/player?culture=en-us&limit={limit}&q={query}&active=1"
        try:
            resp = await client.get(url)
            resp.raise_for_status()
            return resp.json()
        except Exception:
            return []

    async def get_player_landing(self, player_id: int) -> Optional[dict]:
        client = await self._get_client()
        url = f"{NHL_API_BASE}/player/{player_id}/landing"
        try:
            resp = await client.get(url)
            resp.raise_for_status()
            return resp.json()
        except Exception:
            return None

    async def get_player_game_log(self, player_id: int, season: str = "20252026") -> Optional[dict]:
        client = await self._get_client()
        url = f"{NHL_API_BASE}/player/{player_id}/game-log/{season}/2"
        try:
            resp = await client.get(url)
            resp.raise_for_status()
            return resp.json()
        except Exception:
            return None

    async def get_schedule(self, date: str = "now") -> Optional[dict]:
        client = await self._get_client()
        url = f"{NHL_API_BASE}/schedule/{date}"
        try:
            resp = await client.get(url)
            resp.raise_for_status()
            return resp.json()
        except Exception:
            return None

    async def get_standings(self) -> Optional[dict]:
        client = await self._get_client()
        url = f"{NHL_API_BASE}/standings/now"
        try:
            resp = await client.get(url)
            resp.raise_for_status()
            return resp.json()
        except Exception:
            return None


nhl_client = NHLClient()
