from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import settings

client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(
        settings.mongodb_url,
        serverSelectionTimeoutMS=5000,
    )
    db = client[settings.database_name]

    try:
        await client.admin.command("ping")
        print(f"[db] Connected to MongoDB: {settings.database_name}")
        await db.custom_projections.create_index("playerId", unique=True)
    except Exception as e:
        print(f"[db] WARNING: Could not connect to MongoDB: {e}")
        print("[db] Server will start but database operations will fail until MongoDB is available")


async def close_db():
    global client
    if client:
        client.close()
        print("[db] MongoDB connection closed")


def get_db() -> AsyncIOMotorDatabase:
    return db
