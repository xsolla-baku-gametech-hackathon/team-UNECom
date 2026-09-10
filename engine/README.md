# Fraud Detection Engine (/engine)

Post-purchase dəyər axını üçün qraf-əsaslı risk skorlama mühərriki. Oğurlanmış
kartla alınmış oyun valyutası/əşyası/açarının trade/gift/marketplace/key-transfer
vasitəsilə hesablar arasında necə "yuyulduğunu" (fərma halqaları) aşkarlayır.

Bu README **`/api` komandası üçündür** — mühərrikin necə çağırılacağını izah edir.

## Sürətli başlanğıc

```bash
cd engine
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# (opsional, olmasa fallback şablon izah işləyəcək)
export ANTHROPIC_API_KEY=sk-ant-...

uvicorn app.main:app --reload --port 8000
```

Sağlamlıq yoxlaması: `curl http://localhost:8000/health` → `{"status":"ok"}`

## Testlər

Risk skorlama düsturları (taint propagation, velocity, degree imbalance)
və qraf qurulması üçün unit testlər (`tests/`):

```bash
pip install -r requirements-dev.txt
pytest tests/ -v
```

Hazır nümunə data ilə test:

```bash
curl -s -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  --data @sample_data/analyze_request.json | python3 -m json.tool | less
```

(`sample_data/ground_truth.json` faylında bu nümunə datadakı əsl fərma
halqasının hansı hesablardan ibarət olduğu yazılıb — engine bunu OXUMUR,
sadəcə nəticəni yoxlamaq üçündür.)

Öz dataset-inizi yaratmaq üçün: `../data-generator/generate.py` (bax onun öz
qovluğundakı istifadə qaydasına).

## Data kontraktı

Bütün komanda bu event formatına əsaslanır (dəyişməyin):

```json
{
  "event_id": "evt_...",
  "type": "trade | gift | marketplace_sale | key_redeem | purchase",
  "timestamp": "2026-09-09T10:16:25Z",
  "from_account_id": "acct_0123",
  "to_account_id": "acct_0456",
  "asset_type": "currency | item | key",
  "asset_id": "gold_coins",
  "quantity": 250,
  "value_usd_estimate": 12.5,
  "payment_flagged": false,
  "account_created_at": "2026-09-08T03:00:00Z"
}
```

**Konvensiya:** `account_created_at` həmişə `from_account_id`-nin yaranma
tarixidir (yəni "bu hesab nə vaxt açılıb, indi çıxış tranzaksiyası edən kimdir").
`purchase` hadisələrində `from_account_id` sistem hesabı `STORE`-dur və onun
yaranma tarixi yoxdur (`account_created_at: null`).

## Endpoint-lər

### `POST /analyze`

Request body:

```json
{ "events": [ /* Event obyektlərinin siyahısı, yuxarıdakı kontrakta uyğun */ ] }
```

Response (`AnalyzeResponse`):

```json
{
  "analysis_id": "an_a47d710f3a07",
  "generated_at": "2026-09-10T11:30:00Z",
  "num_events": 2626,
  "num_accounts": 352,
  "accounts": [
    {
      "account_id": "mule_014",
      "in_degree": 2, "out_degree": 3,
      "in_value_usd": 264.27, "out_value_usd": 330.66,
      "taint_score": 1.0,
      "velocity_score": 1.0,
      "imbalance_score": 0.0,
      "risk_score": 71.52,
      "community_id": 10,
      "flags": ["tainted-funds", "flagged-purchase-source", "fast-account-fast-spend"]
    }
  ],
  "rings": [
    {
      "ring_id": "ring_10",
      "account_ids": ["hub_1", "mule_000", "..."],
      "size": 43,
      "risk_score": 50.02,
      "avg_taint_score": 0.5857,
      "flagged_purchase_count": 25,
      "total_value_usd": 8376.36,
      "hub_candidates": ["hub_1", "acct_0272", "acct_0236"]
    }
  ]
}
```

`accounts` risk_score-a görə (yüksəkdən aşağıya) sıralanıb. `rings` yalnız
kifayət qədər böyük (≥3 hesab) VƏ kifayət qədər riskli (orta risk ≥15)
icmaları göstərir — hər icma avtomatik "ring" sayılmır.

Hər `POST /analyze` çağırışı nəticəni proses yaddaşında saxlayır və
`analysis_id` qaytarır. Ən son analiz avtomatik "aktiv" sayılır (aşağıya bax).

### `GET /explain/{ring_id}?analysis_id=...`

`ring_id` — `/analyze` cavabındakı `rings[].ring_id` (məs. `ring_10`).
`analysis_id` **optional** — verilməsə, ən son `/analyze` çağırışının
nəticəsi istifadə olunur (tək-analitik demo üçün kifayətdir).

Response (`ExplainResponse`):

```json
{
  "ring_id": "ring_10",
  "explanation": "Bu 43 hesab eyni icmada toplanıb və dəyərin böyük hissəsini hub_1, acct_0272, acct_0236 hesab(lar)ına yönləndirib. Mənbədə 25 bayraqlanmış (payment_flagged) ödəniş aşkarlanıb, ümumi axın dəyəri ~$8,376. orta ehtimalla kart-fırıldaqçılığı ilə əldə edilmiş dəyərin yuyulduğu bir fərma halqası.",
  "ai_generated": true,
  "evidence": { "...": "Claude-a göndərilən strukturlaşdırılmış sübutlar" }
}
```

`ai_generated: false` olarsa, `ANTHROPIC_API_KEY` tapılmayıb (və ya Claude
çağırışı uğursuz olub) — bu halda şablon-əsaslı izah qaytarılır, endpoint heç
vaxt xəta vermir.

### `GET /health`

`{"status": "ok"}` — liveness üçün.

## Risk skorlama necə işləyir

Hər hesab üçün 4 sinyal hesablanır və çəkili cəmlənir (0-100 `risk_score`):

| Sinyal | Nə ölçür | Çəki |
|---|---|---|
| `taint_score` | Hesabın aldığı dəyərin nə qədəri `payment_flagged=true` alışlardan mənşəlidir — qraf boyunca "haircut tainting" ilə yayılır (kripto-forensikada standart üsul) | 0.40 |
| `velocity_score` | Hesab yarandıqdan neçə tez sonra ilk çıxış tranzaksiyası edib (yeni + dərhal aktiv = şübhəli) | 0.25 |
| `imbalance_score` | in-degree/out-degree balanssızlığı (çox giriş, az çıxış = hub-vari) | 0.20 |
| `community_risk` | Hesabın daxil olduğu icmanın (Louvain community detection) orta riski | 0.15 |

Icmalar (`rings`) Louvain alqoritmi ilə (NetworkX-in daxili
`louvain_communities`-i, əlavə asılılıq yoxdur) tranzaksiya qrafında
aşkarlanır, sonra hər icmanın orta riski + bayraqlanmış alış sayı +
ümumi dəyər ilə "ring" kimi qiymətləndirilir.

## Qeydlər `/api` komandası üçün

- Vəziyyət (state) yalnız proses yaddaşındadır — server restart olsa bütün
  analizlər itir. Hakaton prototipi üçün kifayətdir, prod üçün DB lazımdır.
- CORS bütün mənbələr üçün açıqdır (demo sürəti üçün).
- `ANTHROPIC_API_KEY` mühit dəyişəni yoxdursa, `/explain` yenə də işləyir,
  sadəcə AI izahı yerinə şablon mətn qaytarır (`ai_generated: false`).
- `CLAUDE_MODEL` mühit dəyişəni ilə model dəyişdirilə bilər (default:
  `claude-sonnet-5`).
