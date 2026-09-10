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
    "dusdugu Azerbaycan dilinde izah yaz. Cumlelerin sonunda ehtimal seviyyesini "
    "(yuksek/orta/asagi ehtimal) aciq qeyd et. Uydurma fakt elave etme, yalniz "
    "verilen subutlardan istifade et."
)


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

    return {
        "ring_id": ring["ring_id"],
        "account_count": ring["size"],
        "risk_score": ring["risk_score"],
        "avg_taint_score": ring["avg_taint_score"],
        "flagged_purchase_count": ring["flagged_purchase_count"],
        "total_value_usd": ring["total_value_usd"],
        "hub_candidates": ring["hub_candidates"],
        "account_creation_window": {
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

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=400,
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
            raise ValueError("Claude bos cavab qaytardi")
        return text, True
    except Exception:
        logger.exception("Claude API cagirisi ugursuz oldu, sablon izaha kecilir")
        return fallback_template(evidence), False
