"""Umumi data kontraktı (README-də sənədləşdirilib, DƏYİŞMƏ)."""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

EventType = Literal["trade", "gift", "marketplace_sale", "key_redeem", "purchase"]
AssetType = Literal["currency", "item", "key"]


class Event(BaseModel):
    event_id: str
    type: EventType
    timestamp: datetime
    from_account_id: str
    to_account_id: str
    asset_type: AssetType
    asset_id: str
    quantity: int
    value_usd_estimate: float
    payment_flagged: bool = False
    account_created_at: Optional[datetime] = None


class AnalyzeRequest(BaseModel):
    events: list[Event] = Field(..., min_length=1)


class AccountResult(BaseModel):
    account_id: str
    in_degree: int
    out_degree: int
    in_value_usd: float
    out_value_usd: float
    taint_score: float
    velocity_score: float
    imbalance_score: float
    risk_score: float
    community_id: Optional[int]
    flags: list[str]


class RingResult(BaseModel):
    ring_id: str
    account_ids: list[str]
    size: int
    risk_score: float
    avg_taint_score: float
    flagged_purchase_count: int
    total_value_usd: float
    hub_candidates: list[str]


class AnalyzeResponse(BaseModel):
    analysis_id: str
    generated_at: datetime
    num_events: int
    num_accounts: int
    accounts: list[AccountResult]
    rings: list[RingResult]


class ExplainResponse(BaseModel):
    ring_id: str
    explanation: str
    ai_generated: bool
    evidence: dict
