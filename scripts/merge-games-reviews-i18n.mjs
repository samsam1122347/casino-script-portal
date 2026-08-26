/**
 * Merges gamesCatalog, partnersBlock, reviewsBlock, newsBlock into locale files.
 * Run: node scripts/merge-games-reviews-i18n.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, "..", "messages");

/** @type {Record<string, Record<string, unknown>>} */
const locales = {
  de: {
    gamesCatalog: {
      crash: "Crash",
      "crash-classic": "Klassische Runden",
      "crash-turbo": "Turbo-Tempo",
      "crash-auto": "Auto-Cashout",
      "crash-provably": "Nachweislich fair",
      "crash-live": "Live-Multiplikator",
    },
    partnersBlock: {
      sectionTitle: "Crash-Partner",
      "werder-bremen-desc":
        "Offizieller Partner — exklusive Crash-Promos an Spieltagen für CrashX-Spieler.",
      "crypto-com-desc":
        "On-Ramp-Partner für schnellere Einzahlungen und zurück an die Crash-Runden.",
      "ufc-desc":
        "Sponsor-Pakete mit Fight-Night-Crash-Leaderboards und Bonuspools.",
    },
    reviewsBlock: {
      sectionTitle: "Bewertungen",
      playerSince: "Spieler seit",
      readMore: "Mehr lesen",
      starsAria: "{rating} von 5 Sternen",
      "olive-body":
        "Riesigen Crash-Multiplikator ausgezahlt und on-chain in zwei Minuten abgehoben — UI ist sauber, die Kurve wirkt ehrlich.",
      "hap10-body":
        "Schnelle Einzahlungen, einfacher Auto-Cashout beim Crash, Support liest wirklich Tickets. Nur dieses Spiel zählt für mich.",
      "1shaw-body":
        "Nachweislich fairer Crash mit echt hohen Multiplikatoren. Liebe die transparenten Seeds.",
    },
    newsBlock: { viewAll: "Alle anzeigen" },
  },
  es: {
    gamesCatalog: {
      crash: "Crash",
      "crash-classic": "Rondas clásicas",
      "crash-turbo": "Velocidad turbo",
      "crash-auto": "Auto cobro",
      "crash-provably": "Demostrablemente justo",
      "crash-live": "Multiplicador en vivo",
    },
    partnersBlock: {
      sectionTitle: "Socios Crash",
      "werder-bremen-desc":
        "Socio oficial — promos Crash exclusivos en días de partido.",
      "crypto-com-desc":
        "Socio on-ramp para ingresar antes y volver a las rondas Crash.",
      "ufc-desc": "Campañas con tablas Crash en noches de combate y pools.",
    },
    reviewsBlock: {
      sectionTitle: "Reseñas",
      playerSince: "Jugador desde",
      readMore: "Leer más",
      starsAria: "{rating} de 5 estrellas",
      "olive-body":
        "Cobré un gran multiplicador Crash y retiré on-chain en dos minutos — UI limpia y la curva se siente honesta.",
      "hap10-body":
        "Depósitos rápidos, auto cobro fácil en Crash y el soporte lee el ticket. Solo vengo por este juego.",
      "1shaw-body":
        "Crash demostrablemente justo con multiplicadores altísimos. Me encantan las seeds transparentes.",
    },
    newsBlock: { viewAll: "Ver todo" },
  },
  fr: {
    gamesCatalog: {
      crash: "Crash",
      "crash-classic": "Manches classiques",
      "crash-turbo": "Vitesse turbo",
      "crash-auto": "Auto cash-out",
      "crash-provably": "Prouvé équitable",
      "crash-live": "Multiplicateur en direct",
    },
    partnersBlock: {
      sectionTitle: "Partenaires Crash",
      "werder-bremen-desc":
        "Partenaire officiel — promos Crash exclusives les jours de match.",
      "crypto-com-desc":
        "Partenaire on-ramp pour financer plus vite et revenir aux parties Crash.",
      "ufc-desc": "Actions avec classements Crash les soirs de combat et pools bonus.",
    },
    reviewsBlock: {
      sectionTitle: "Avis",
      playerSince: "Joueur depuis",
      readMore: "Lire la suite",
      starsAria: "{rating} sur 5 étoiles",
      "olive-body":
        "Un énorme multiplicateur Crash encaissé et retrait on-chain en deux minutes — UI propre, courbe honnête.",
      "hap10-body":
        "Dépôts rapides, auto cash-out simple sur Crash, le support lit vraiment les tickets. Je ne viens que pour ce jeu.",
      "1shaw-body":
        "Crash équitable avec des multiplicateurs énormes. J’adore les seeds transparents.",
    },
    newsBlock: { viewAll: "Tout voir" },
  },
  pt: {
    gamesCatalog: {
      crash: "Crash",
      "crash-classic": "Rodadas clássicas",
      "crash-turbo": "Velocidade turbo",
      "crash-auto": "Auto cash-out",
      "crash-provably": "Provably fair",
      "crash-live": "Multiplicador ao vivo",
    },
    partnersBlock: {
      sectionTitle: "Parceiros Crash",
      "werder-bremen-desc":
        "Parceiro oficial — promos Crash exclusivos em dias de jogo.",
      "crypto-com-desc":
        "Parceiro on-ramp para depositar mais rápido e voltar às rondas Crash.",
      "ufc-desc":
        "Campanhas com leaderboards Crash em noites de luta e prize pools.",
    },
    reviewsBlock: {
      sectionTitle: "Avaliações",
      playerSince: "Jogador desde",
      readMore: "Ler mais",
      starsAria: "{rating} de 5 estrelas",
      "olive-body":
        "Saquei um multiplicador Crash enorme e levantei on-chain em dois minutos — UI limpa, curva honesta.",
      "hap10-body":
        "Depósitos rápidos, auto cash-out fácil no Crash e o suporte lê o ticket. Só venho por este jogo.",
      "1shaw-body":
        "Crash provably fair com multiplicadores altíssimos. Adoro as seeds transparentes.",
    },
    newsBlock: { viewAll: "Ver tudo" },
  },
  ru: {
    gamesCatalog: {
      crash: "Crash",
      "crash-classic": "Классические раунды",
      "crash-turbo": "Турбо-скорость",
      "crash-auto": "Авто-кэшаут",
      "crash-provably": "Честная игра",
      "crash-live": "Лайв-множитель",
    },
    partnersBlock: {
      sectionTitle: "Партнёры Crash",
      "werder-bremen-desc":
        "Официальный партнёр — эксклюзивные Crash-промо в матчевые дни.",
      "crypto-com-desc":
        "Он-рамп партнёр — быстрее пополниться и вернуться к раундам Crash.",
      "ufc-desc":
        "Совместные акции: таблицы Crash в бои и бонусные пулы.",
    },
    reviewsBlock: {
      sectionTitle: "Отзывы",
      playerSince: "Игрок с",
      readMore: "Подробнее",
      starsAria: "{rating} из 5 звёзд",
      "olive-body":
        "Огромный множитель Crash и вывод on-chain за две минуты — чистый UI, честная кривая.",
      "hap10-body":
        "Быстрые депозиты, удобный авто-кэшаут в Crash, поддержка читает тикеты. Играю только здесь.",
      "1shaw-body":
        "Честный Crash с сумасшедшими множителями. Нравятся прозрачные сиды.",
    },
    newsBlock: { viewAll: "Смотреть все" },
  },
  tr: {
    gamesCatalog: {
      crash: "Crash",
      "crash-classic": "Klasik turlar",
      "crash-turbo": "Turbo hız",
      "crash-auto": "Otomatik çekim",
      "crash-provably": "Kanıtlanabilir adil",
      "crash-live": "Canlı çarpan",
    },
    partnersBlock: {
      sectionTitle: "Crash ortakları",
      "werder-bremen-desc":
        "Resmi ortak — maç günlerinde CrashX oyuncularına özel Crash promosyonları.",
      "crypto-com-desc":
        "Hızlı fonlama için on-ramp ortağı — tekrar Crash turlarına dön.",
      "ufc-desc":
        "Fight-night Crash lider tabloları ve ödül havuzlarıyla sponsor bağlantıları.",
    },
    reviewsBlock: {
      sectionTitle: "Yorumlar",
      playerSince: "Oyuncu olma",
      readMore: "Devamını oku",
      starsAria: "5 üzerinden {rating} yıldız",
      "olive-body":
        "Büyük bir Crash çarpanı nakde çevirdim ve iki dakikada zincir üstü çekim — arayüz temiz, eğri dürüst.",
      "hap10-body":
        "Hızlı yatırımlar, Crash'te kolay otomatik çekim ve destek talebi gerçekten okunuyor. Sadece bu oyun için geliyorum.",
      "1shaw-body":
        "Şeffaf seedlerle kanıtlanabilir adil Crash, çok yüksek çarpanlar.",
    },
    newsBlock: { viewAll: "Tümünü gör" },
  },
  ja: {
    gamesCatalog: {
      crash: "Crash",
      "crash-classic": "クラシックラウンド",
      "crash-turbo": "ターボスピード",
      "crash-auto": "オートキャッシュアウト",
      "crash-provably": "証明可能なフェアネス",
      "crash-live": "ライブマルチプライヤー",
    },
    partnersBlock: {
      sectionTitle: "Crashパートナー",
      "werder-bremen-desc":
        "公式パートナー — 試合日にCrashXプレイヤー向け限定プロモ。",
      "crypto-com-desc":
        "オンレンプパートナーで素早く入金しCrashラウンドへ。",
      "ufc-desc":
        "ファイトナイトのCrashリーダーボードとボーナスプール連動。",
    },
    reviewsBlock: {
      sectionTitle: "レビュー",
      playerSince: "参加",
      readMore: "続きを読む",
      starsAria: "5段階中{rating}",
      "olive-body":
        "巨大なCrash乗数をキャッシュアウトし2分でオンチェーン出金 — UIはクリーンで曲線は公正に感じる。",
      "hap10-body":
        "入金が速くCrashの自動キャッシュアウトも簡単、サポートがチケットを読む。このゲームだけのためだけに来る。",
      "1shaw-body":
        "透明なシードが証明可能なフェアなCrash、桁外れの乗数。",
    },
    newsBlock: { viewAll: "すべて表示" },
  },
};

const keys = ["gamesCatalog", "partnersBlock", "reviewsBlock", "newsBlock"];

for (const [locale, patch] of Object.entries(locales)) {
  const fp = path.join(messagesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(fp, "utf8"));
  for (const key of keys) {
    data[key] = structuredClone(patch[key]);
  }
  fs.writeFileSync(fp, `${JSON.stringify(data, null, 2)}\n`);
}

console.log("Merged games/partners/reviews/news blocks");
