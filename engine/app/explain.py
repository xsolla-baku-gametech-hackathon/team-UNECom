"""Claude API ile bayraqlanmis halqalar ucun insan-dilinde izah qatı.

ANTHROPIC_API_KEY tapilmasa (veya cagiris ugursuz olsa) sablon-esasli
fallback izah qaytarilir - demo bu deyisken uzerinden asilamaz.
"""
from __future__ import annotations

import json
import logging
import os

logger = logging.getLogger("engine.explain")

CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-5")

SYSTEM_PROMPT = (
    "Sen bir fraud detection analitikisen. Sene qraf-analitikasindan cixan "
    "eded-esasli subutlar verilir (hesab sayi, yaranma-fasilesi, bayraqlanmis "
    "odenis sayi, deyer, in/out-degree balanssizligi). Bu subutlara esaslanaraq "
    "QISA (2-4 cumle), konkret ededleri isteyen, insanlarin asanliqla basa "
    "dusdugu {language} izah yaz. Cumlelerin sonunda ehtimal seviyyesini "
    "(yuksek/orta/asagi ehtimal) aciq qeyd et. Uydurma fakt elave etme, yalniz "
    "verilen subutlardan istifade et. hub_candidate_details her hub namizedinin "
    "oz olculmus gostericilerini verir (in/out-degree, gelen/geden deyer, taint, "
    "oz adina bayraqlanmis alis sayi) - hub-un rolunu bunlarla esaslandir. "
    "top_risk_accounts_creation_window yalniz en riskli hesablara aiddir, butun "
    "halqaya aid etme. JSON sahe adlarini (field names) metnde yazma."
)

# The case text is the largest block on screen. The pitch is in English, so a
# jury that does not read Azerbaijani can switch it with EXPLAIN_LANGUAGE=en
# (default az). The fallback template and the dashboard chrome stay as they are.
_LANGUAGES = {
    "az": ("Azerbaycan dilinde", "(yuksek/orta/asagi ehtimal)"),
    "en": ("ingilis dilinde (in English)", "(high/medium/low likelihood)"),
}
EXPLAIN_LANGUAGE = os.getenv("EXPLAIN_LANGUAGE", "az").lower()
if EXPLAIN_LANGUAGE not in _LANGUAGES:
    EXPLAIN_LANGUAGE = "az"
_lang_phrase, _likelihood = _LANGUAGES[EXPLAIN_LANGUAGE]
SYSTEM_PROMPT = SYSTEM_PROMPT.replace("{language}", _lang_phrase).replace(
    "(yuksek/orta/asagi ehtimal)", _likelihood
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

    # Icmaya bezen aşağı-riskli cash-out qarşı-tərəfləri de qarışa bilir
    # (məs. hub-un mal satdığı təmiz alıcılar) — yaranma pəncərəsini yalnız
    # ən riskli hesablar üzərindən hesablamaq bunu seyreltmir.
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
    hubs = ", ".join(evidence["hub_candidates"]) or "naməlum hub"
    risk = evidence["risk_score"]
    value = evidence["total_value_usd"]

    if risk >= 60:
        confidence = "yüksək ehtimalla"
    elif risk >= 30:
        confidence = "orta ehtimalla"
    else:
        confidence = "aşağı ehtimalla"

    return (
        f"Bu {n} hesab eyni icmada toplanıb və dəyərin böyük hissəsini "
        f"{hubs} hesab(lar)ına yönləndirib. Mənbədə {flagged} bayraqlanmış "
        f"(payment_flagged) ödəniş aşkarlanıb, ümumi axın dəyəri ~${value:,.0f}. "
        f"{confidence} kart-fırıldaqçılığı ilə əldə edilmiş dəyərin yuyulduğu "
        f"bir fərma halqası. [Şablon izah — Claude API əlçatan deyil]"
    )


def call_claude(evidence: dict) -> tuple[str, bool]:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        logger.info("ANTHROPIC_API_KEY yoxdur, sablon izaha keçilir")
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
                        "Bu bayraqlanmış halqa üçün izah yaz:\n\n"
                        + json.dumps(evidence, ensure_ascii=False, indent=2)
                    ),
                }],
            )
            text = "".join(
                block.text for block in response.content if getattr(block, "type", None) == "text"
            ).strip()
            if not text:
                raise ValueError(f"Claude bos cavab qaytardi (stop_reason={response.stop_reason})")
            return text, True
        except Exception:
            logger.exception("Claude API cagirisi ugursuz oldu (cehd %d/%d)", attempt, CLAUDE_ATTEMPTS)
    return fallback_template(evidence), False
