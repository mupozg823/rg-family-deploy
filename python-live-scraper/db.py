"""
Supabase Database Operations
"""
from datetime import datetime, timezone
from typing import Optional
from supabase import create_client, Client

from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEBUG
from scraper import LiveStatus


def get_supabase_client() -> Client:
    """Supabase 클라이언트 생성"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")

    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def extract_user_id_from_url(url: str) -> Optional[str]:
    """
    PandaTV URL에서 유저 ID 추출

    Examples:
        "https://www.pandalive.co.kr/play/s22unn22" -> "s22unn22"
        "https://www.pandalive.co.kr/s22unn22" -> "s22unn22"
    """
    import re

    if not url:
        return None

    # pandalive.co.kr 도메인 확인
    if "pandalive.co.kr" not in url:
        return None

    # /play/xxx 또는 /xxx 형식
    match = re.search(r'pandalive\.co\.kr/(?:play/)?([^/?#]+)', url)
    return match.group(1) if match else None


def get_pandatv_members(client: Client) -> list[dict]:
    """
    PandaTV URL이 있는 활성 멤버 조회

    Returns:
        [{"id": 1, "user_id": "s22unn22", "is_live": false}, ...]
    """
    response = client.table("organization").select(
        "id, social_links, is_live"
    ).eq("is_active", True).execute()

    members = []
    for row in response.data:
        social_links = row.get("social_links") or {}
        pandatv_url = social_links.get("pandatv")

        if pandatv_url:
            user_id = extract_user_id_from_url(pandatv_url)
            if user_id:
                members.append({
                    "id": row["id"],
                    "user_id": user_id,
                    "is_live": row.get("is_live", False)
                })

    return members


def update_live_status(
    client: Client,
    member_id: int,
    user_id: str,
    status: LiveStatus
) -> None:
    """
    라이브 상태 업데이트

    - live_status 테이블 upsert
    - organization.is_live 업데이트
    """
    now = datetime.now(timezone.utc).isoformat()

    # live_status 테이블 upsert
    live_status_data = {
        "member_id": member_id,
        "platform": "pandatv",
        "stream_url": f"https://www.pandalive.co.kr/play/{user_id}",
        "thumbnail_url": status.thumbnail_url,
        "is_live": status.is_live,
        "viewer_count": status.viewer_count or 0,
        "last_checked": now,
    }

    try:
        client.table("live_status").upsert(
            live_status_data,
            on_conflict="member_id,platform"
        ).execute()

        if DEBUG:
            print(f"[DB] Updated live_status for member {member_id}")
    except Exception as e:
        print(f"[DB] Error updating live_status: {e}")

    # organization.is_live 업데이트
    try:
        client.table("organization").update({
            "is_live": status.is_live
        }).eq("id", member_id).execute()

        if DEBUG:
            print(f"[DB] Updated organization.is_live for member {member_id} to {status.is_live}")
    except Exception as e:
        print(f"[DB] Error updating organization: {e}")


def batch_update_live_status(
    client: Client,
    members: list[dict],
    statuses: list[LiveStatus]
) -> dict:
    """
    여러 멤버의 라이브 상태 일괄 업데이트

    Returns:
        {"total": 10, "updated": 8, "live": 2, "errors": [...]}
    """
    result = {
        "total": len(members),
        "updated": 0,
        "live": 0,
        "errors": []
    }

    # user_id -> status 맵
    status_map = {s.user_id: s for s in statuses}

    for member in members:
        user_id = member["user_id"]
        status = status_map.get(user_id)

        if not status:
            result["errors"].append(f"No status for {user_id}")
            continue

        if status.error:
            result["errors"].append(f"{user_id}: {status.error}")
            continue

        try:
            update_live_status(client, member["id"], user_id, status)
            result["updated"] += 1
            if status.is_live:
                result["live"] += 1
        except Exception as e:
            result["errors"].append(f"{user_id}: {str(e)}")

    return result
