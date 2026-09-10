# Pitch outline — slayd strukturu

3 dəqiqəlik pitch üçün 6 slayd tövsiyə olunur (~30 saniyə/slayd, demo canlı
dashboard-da aparılır — bax `demo-script.md`). Hər slayd başlığı altında nə
göstəriləcəyi və danışılacaq əsas fikir var.

---

## Slayd 1 — What you built

**Başlıq:** Post-Purchase Value Flow — Fraud Radar

**Ekranda:** Layihə adı, bir cümləlik təsvir, komanda loqosu/adı.

**Əsas fikir:**
Oyun iqtisadiyyatında hesablar arası dəyər axınını (ticarət, hədiyyə,
bazar satışı, key redeem, alış) canlı qraf kimi vizuallaşdıran və
fırıldaq halqalarını (məs. "gold farming") avtomatik aşkarlayıb insan
dilində izah edən araşdırma aləti.

---

## Slayd 2 — Problem

**Ekranda:** Sadə statistika/illüstrasiya — "min hesab, milyon əməliyyat,
gizlənən bir neçə fırıldaq halqası".

**Əsas fikir:**
- Post-purchase (alışdan sonrakı) dəyər axını — valyuta/əşyaların hesablar
  arası hərəkəti — gözdən qaçır, çünki fokus adətən ödəniş anındadır.
- Fırıldaq halqaları (mule hesablar → hub) minlərlə təmiz əməliyyat
  arasında gizlənir; manual analiz miqyaslanmır.
- Yanlış bayraqlama (false positive) real, sadiq oyunçunu itirmək
  deməkdir — bu da gəlir itkisidir, təkcə təhlükəsizlik problemi deyil.

---

## Slayd 3 — Solution

**Ekranda:** Canlı dashboard demo başlayır (bax `demo-script.md`, 0:00–2:35).

**Əsas fikir:**
- Force-directed qraf: hər node = hesab, rəng = risk skoru
  (yaşıl→sarı→qırmızı), bayraqlanmış halqalar qırmızı konturla seçilir.
- Tənzimlənə bilən "şübhəlilik həssaslığı" — analitik neçə həssas
  axtarış istədiyini real vaxtda seçir, real oyunçular səhvən
  bloklanmır.
- Hər bayraqlanmış halqaya klik → Claude-un yazdığı insan-dilində izahat
  + siqnallar + tövsiyə → araşdırmaçı "Real oyunçudur / Fırıldaqdır"
  qərarını verir (human-in-the-loop, avtomatik bloklama yoxdur).

---

## Slayd 4 — Features & users

**Ekranda:** İki sütun — "Nə edir" / "Kim istifadə edir".

**Əsas fikir:**

| Xüsusiyyət | Təsvir |
|---|---|
| Canlı qraf vizuallaşdırması | WebGL-canvas əsaslı, minlərlə hesabı göstərə bilir |
| Risk skorlama | Hesab yaşı, əməliyyat nümunəsi, payment_flagged siqnalı |
| Tənzimlənən həssaslıq | Qlobal slider (analitik) + halqa-səviyyəli override (dizayner) |
| AI izahat | Claude — xam rəqəm əvəzinə oxunaqlı, hərəkətə keçirilə bilən mətn |
| İnvestigasiya iş axını | Klik → izah → qərar → status (pending/confirmed) |

**İstifadəçilər:** Trust & Safety / fraud analitikləri, oyun
iqtisadiyyatı komandaları, ödəniş risk komandaları.

**İnteqrasiya — iki qat:** CSV/JSON yükləmə yeganə yol deyil, "sıfır
öhdəlik" sınaq qapısıdır. Production üçün eyni `/events` API-yə oyunun
öz backend-i real-vaxtda push edir (webhook/SDK tərzi) — Xsolla kimi
müştəri üçün əsl inteqrasiya budur, fayl yükləmə isə demo/backfill
üçündür.

---

## Slayd 5 — Monetization

**Ekranda:** Sadə model diaqramı.

**Əsas fikir:**
- **B2B SaaS** — oyun studiyalarına/naşirlərə aylıq abunə, hesab/əməliyyat
  həcminə görə qatlı qiymətləndirmə.
- **Xilas edilən dəyər üzərindən komissiya** — aşkarlanan və dayandırılan
  fırıldaq həcminin faizi (performansa əsaslanan model, satışı asanlaşdırır).
- **Platform inteqrasiyası** — Xsolla kimi ödəniş/mağaza platformaları üçün
  əlavə risk-modulu (mövcud müştəri bazasına upsell).

---

## Slayd 6 — Team

**Ekranda:** Komanda üzvləri, rol, GitHub handle.

**Əsas fikir (doldurulmalı):**

| Ad | Rol |
|---|---|
| _(doldur)_ | Backend / API + Engine |
| _(doldur)_ | Game Designer / Product & UX (dashboard, demo, pitch) |
| _(doldur)_ | Data / Fraud detection məntiqi |
| _(doldur)_ | _(digər rol)_ |

Repo: `github.com/xsolla-baku-gametech-hackathon/team-UNECom`
