"""Plain-language explanation layer for flagged rings, written by Claude.

If ANTHROPIC_API_KEY is missing (or the call fails twice), a template
explanation is returned instead, so the demo never depends on the key.
"""
from __future__ import annotations

import json
import logging
import os

logger = logging.getLogger("engine.explain")

CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-5")

SYSTEM_PROMPT = (
    "You are a fraud detection analyst. You receive numeric evidence from a "
    "value-flow graph analysis of an in-game economy (account count, account "
    "creation window, flagged payment count, value, in/out-degree imbalance). "
    "Based only on that evidence, write a SHORT explanation in English (2-4 "
    "sentences) that cites concrete numbers and that a trust & safety analyst "
    "can read at a glance. End each claim with an explicit likelihood (high / "
    "medium / low likelihood). Do not invent facts; use only the evidence "
    "given. hub_candidate_details gives each hub candidate's own measurements "
    "(in/out degree, value in/out, taint, flagged purchases of its own): use "
    "them to justify the hub's role. top_risk_accounts_creation_window covers "
    "only the highest-risk accounts, not the whole ring. Do not write JSON "
    "field names in the text, and do not use Markdown."
)

# One retry: an empty completion was seen ~1 in 5 calls in rehearsal, and a
# template on screen reads as "Claude is down". Two attempts of ~13 s still
# fit the API's 30 s explanation timeout.
CLAUDE_ATTEMPTS = 2


def build_evidence(
    ring: dict,
    account_scores: dict[str, dict],
    taint: dict[str, dict],
    account_created_at: dict,
) -> dict:
    members = ring["account_ids"]
    top_accounts = sorted(
        members,
        key=lambda m: account_scores.get(m, {}).get("risk_score", 0.0),
        reverse=True,
    )[:5]

    # Low-risk cash-out counterparties can end up in the community too (e.g.
    # clean buyers the hub sold items to); computing the creation window over
    # the riskiest accounts only keeps them from diluting it.
    ages_hours = [
        account_created_at[m] for m in top_accounts if account_created_at.get(m)
    ]

    # Hubs are usually NOT among the top-risk accounts (aged, low velocity -
    # see docs/accuracy.md), so without their own numbers the model can only
    # say the hub's role is unconfirmed. Give it the measurements that make
    # the case: value in vs out, degree, and zero flagged purchases of its own.
    hub_candidate_details = [
        {
            "account_id": h,
            "in_degree": account_scores.get(h, {}).get("in_degree"),
            "out_degree": account_scores.get(h, {}).get("out_degree"),
            "in_value_usd": account_scores.get(h, {}).get("in_value_usd"),
            "out_value_usd": account_scores.get(h, {}).get("out_value_usd"),
            "taint_score": taint.get(h, {}).get("taint_score"),
            "own_flagged_purchase_count": taint.get(h, {}).get("flagged_purchase_count", 0),
            "account_created_at": account_created_at[h].isoformat() if account_created_at.get(h) else None,
        }
        for h in ring["hub_candidates"]
    ]

    return {
        "ring_id": ring["ring_id"],
        "account_count": ring["size"],
        "risk_score": ring["risk_score"],
        "avg_taint_score": ring["avg_taint_score"],
        "flagged_purchase_count": ring["flagged_purchase_count"],
        "total_value_usd": ring["total_value_usd"],
        "hub_candidates": ring["hub_candidates"],
        "hub_candidate_details": hub_candidate_details,
        # Computed over the top-risk accounts only (see above), so it is named
        # that way: otherwise the model reports it as the whole ring's window.
        "top_risk_accounts_creation_window": {
            "earliest": min(ages_hours).isoformat() if ages_hours else None,
            "latest": max(ages_hours).isoformat() if ages_hours else None,
        },
        "top_risk_accounts": [
            {
                "account_id": a,
                "risk_score": account_scores.get(a, {}).get("risk_score"),
                "taint_score": taint.get(a, {}).get("taint_score"),
                "in_degree": account_scores.get(a, {}).get("in_degree"),
                "out_degree": account_scores.get(a, {}).get("out_degree"),
                "flags": account_scores.get(a, {}).get("flags"),
            }
            for a in top_accounts
        ],
    }


def fallback_template(evidence: dict) -> str:
    n = evidence["account_count"]
    flagged = evidence["flagged_purchase_count"]
    hubs = ", ".join(evidence["hub_candidates"]) or "an unknown hub"
    risk = evidence["risk_score"]
    value = evidence["total_value_usd"]

    if risk >= 60:
        confidence = "High likelihood"
    elif risk >= 30:
        confidence = "Medium likelihood"
    else:
        confidence = "Low likelihood"

    return (
        f"These {n} accounts sit in one community and route most of their value "
        f"to {hubs}. The source shows {flagged} flagged payments, with about "
        f"${value:,.0f} flowing through the ring. {confidence} of a farming ring "
        f"laundering value bought with stolen cards. "
        f"[Template text: Claude API unavailable]"
    )


def call_claude(evidence: dict) -> tuple[str, bool]:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        logger.info("ANTHROPIC_API_KEY not set, using the template explanation")
        return fallback_template(evidence), False

    import anthropic

    client = anthropic.Anthropic(api_key=api_key)
    for attempt in range(1, CLAUDE_ATTEMPTS + 1):
        try:
            response = client.messages.create(
                model=CLAUDE_MODEL,
                max_tokens=700,
                system=SYSTEM_PROMPT,
                messages=[{
                    "role": "user",
                    "content": (
                        "Explain this flagged ring:\n\n"
                        + json.dumps(evidence, ensure_ascii=False, indent=2)
                    ),
                }],
            )
            text = "".join(
                block.text for block in response.content if getattr(block, "type", None) == "text"
            ).strip()
            if not text:
                raise ValueError(f"Claude returned an empty completion (stop_reason={response.stop_reason})")
            return text, True
        except Exception:
            logger.exception("Claude API call failed (attempt %d/%d)", attempt, CLAUDE_ATTEMPTS)
    return fallback_template(evidence), False
