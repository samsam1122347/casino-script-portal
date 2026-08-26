import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, "..", "messages");

/** @type {Record<string, Record<string, unknown>>} */
const locales = {
  de: {
    newsArticles: {
      editorialAuthor: "CrashX Redaktion",
      backToNews: "Alle News",
      readMore: "Mehr lesen",
      byAuthor: "Von {author}",
      footerBlurb:
        "Bleib dran: Produkt-Updates, Partnerschaften und Spieler-Guides im News-Feed.",
      items: {
        "trust-wallet-deposit": {
          title: "Crash-Guthaben mit Trust Wallet aufladen",
          excerpt:
            "Schritt für Schritt: USDT oder andere Assets hinzufügen und in unter einer Minute wieder an Crash.",
          body:
            "CrashX unterstützt direkte Einzahlungen aus Trust Wallet über mehrere Netzwerke. Öffne die Einzahlungsseite, wähle dein Asset, scanne den QR-Code mit Trust Wallet — nach einer Netzwerk-Bestätigung sind die Mittel da. Auf USDT (TRC20) oft unter 30 Sekunden, dann ab in die Crash-Runden.",
          category: "Guide",
        },
        "bank-card-deposit": {
          title: "Einzahlung per Karte für Crash-Spieler",
          excerpt:
            "Mit VISA, Mastercard, Apple Pay oder Google Pay aufladen — sofortige Umrechnung ins Spielguthaben.",
          body:
            "In unterstützten Regionen kannst du Fiat per Bankkarte einzahlen. Automatische Umrechnung in USDT und Gutschrift auf dein CrashX-Guthaben. Apple Pay und Google Pay mobil — ideal zum Aufladen zwischen Crash-Runden.",
          category: "Produkt",
        },
      },
    },
  },
  es: {
    newsArticles: {
      editorialAuthor: "Redacción CrashX",
      backToNews: "Todas las noticias",
      readMore: "Leer más",
      byAuthor: "Por {author}",
      footerBlurb:
        "Mantente atento al feed: actualizaciones, socios y guías para jugadores.",
      items: {
        "trust-wallet-deposit": {
          title: "Fondea tu saldo Crash con Trust Wallet",
          excerpt:
            "Paso a paso: añade USDT u otros activos y vuelve a Crash en menos de un minuto.",
          body:
            "CrashX admite depósitos directos desde Trust Wallet en varias redes. Abre Depósito, elige el activo, escanea el QR con Trust Wallet y los fondos llegan tras una confirmación de red. En USDT (TRC20) suele ser en menos de 30 segundos — luego a jugar Crash.",
          category: "Guía",
        },
        "bank-card-deposit": {
          title: "Depósitos con tarjeta para jugadores de Crash",
          excerpt:
            "Recarga con VISA, Mastercard, Apple Pay o Google Pay — conversión instantánea al saldo.",
          body:
            "En regiones compatibles, deposita fiat con tarjeta. Conversión automática a USDT en tu saldo CrashX. Apple Pay y Google Pay en móvil para recargar entre rondas de Crash.",
          category: "Producto",
        },
      },
    },
  },
  fr: {
    newsArticles: {
      editorialAuthor: "Rédaction CrashX",
      backToNews: "Toutes les actus",
      readMore: "Lire la suite",
      byAuthor: "Par {author}",
      footerBlurb:
        "Suivez le fil d’actu : mises à jour produit, partenariats et guides joueurs.",
      items: {
        "trust-wallet-deposit": {
          title: "Alimentez votre solde Crash avec Trust Wallet",
          excerpt:
            "Étape par étape : ajoutez des USDT ou d’autres actifs et revenez à Crash en moins d’une minute.",
          body:
            "CrashX accepte les dépôts directs depuis Trust Wallet sur plusieurs réseaux. Ouvrez Dépôt, choisissez l’actif, scannez le QR avec Trust Wallet — après une confirmation réseau, les fonds sont là. Souvent moins de 30 s en USDT (TRC20), puis place au Crash.",
          category: "Guide",
        },
        "bank-card-deposit": {
          title: "Dépôts par carte pour les joueurs Crash",
          excerpt:
            "Rechargez avec VISA, Mastercard, Apple Pay ou Google Pay — conversion instantanée vers le solde.",
          body:
            "Dans les régions prises en charge, déposez en fiat par carte. Conversion automatique en USDT sur votre solde CrashX. Apple Pay et Google Pay sur mobile entre les manches.",
          category: "Produit",
        },
      },
    },
  },
  pt: {
    newsArticles: {
      editorialAuthor: "Redação CrashX",
      backToNews: "Todas as notícias",
      readMore: "Ler mais",
      byAuthor: "Por {author}",
      footerBlurb:
        "Acompanhe o feed para novidades, parcerias e guias para jogadores.",
      items: {
        "trust-wallet-deposit": {
          title: "Carregue o saldo Crash com Trust Wallet",
          excerpt:
            "Passo a passo: adicione USDT ou outros ativos e volte ao Crash em menos de um minuto.",
          body:
            "A CrashX aceita depósitos diretos da Trust Wallet em várias redes. Abra Depósito, escolha o ativo, leia o QR com a Trust Wallet — após confirmação na rede, o valor credita. Em USDT (TRC20) muitas vezes em menos de 30 segundos.",
          category: "Guia",
        },
        "bank-card-deposit": {
          title: "Depósitos com cartão para jogadores de Crash",
          excerpt:
            "Recarregue com VISA, Mastercard, Apple Pay ou Google Pay — conversão instantânea para o saldo.",
          body:
            "Em regiões suportadas, deposite fiat com cartão. Conversão automática para USDT no saldo CrashX. Apple Pay e Google Pay no telemóvel entre rondas.",
          category: "Produto",
        },
      },
    },
  },
  ru: {
    newsArticles: {
      editorialAuthor: "Редакция CrashX",
      backToNews: "Все новости",
      readMore: "Подробнее",
      byAuthor: "Автор: {author}",
      footerBlurb:
        "Следите за лентой: обновления продукта, партнёрства и гайды для игроков.",
      items: {
        "trust-wallet-deposit": {
          title: "Пополнение баланса Crash через Trust Wallet",
          excerpt:
            "Пошагово: добавьте USDT или другие активы и вернитесь в Crash меньше чем за минуту.",
          body:
            "CrashX принимает прямые депозиты из Trust Wallet в нескольких сетях. Откройте страницу депозита, выберите актив, отсканируйте QR в Trust Wallet — после подтверждения в сети средства на счёте. Для USDT (TRC20) часто меньше 30 секунд — и в бой в Crash.",
          category: "Гайд",
        },
        "bank-card-deposit": {
          title: "Карточные депозиты для игроков Crash",
          excerpt:
            "Пополнение VISA, Mastercard, Apple Pay или Google Pay — мгновенная конвертация в игровой баланс.",
          body:
            "В поддерживаемых регионах можно внести фиат картой. Автоматическая конвертация в USDT на баланс CrashX. Apple Pay и Google Pay в мобильном приложении между раундами.",
          category: "Продукт",
        },
      },
    },
  },
  tr: {
    newsArticles: {
      editorialAuthor: "CrashX Editör",
      backToNews: "Tüm haberler",
      readMore: "Devamını oku",
      byAuthor: "{author}",
      footerBlurb:
        "Ürün güncellemeleri, ortaklıklar ve oyuncu rehberleri için haber akışını takip edin.",
      items: {
        "trust-wallet-deposit": {
          title: "Trust Wallet ile Crash bakiyeni yükle",
          excerpt:
            "Adım adım: USDT veya başka varlık ekleyin ve bir dakikadan kısa sürede Crash'e dönün.",
          body:
            "CrashX, Trust Wallet üzerinden birden fazla ağda doğrudan yatırımı destekler. Yatırım sayfasını açın, varlığı seçin, QR'ı Trust Wallet ile tarayın — ağ onayından sonra bakiye gelir. USDT (TRC20) genelde 30 saniyenin altında.",
          category: "Rehber",
        },
        "bank-card-deposit": {
          title: "Crash oyuncuları için kart yatırımları",
          excerpt:
            "VISA, Mastercard, Apple Pay veya Google Pay ile yükleme — anında oyun bakiyesine dönüşüm.",
          body:
            "Desteklenen bölgelerde banka kartıyla fiat yatırabilirsiniz. Otomatik USDT dönüşümü ve CrashX bakiyenize yansıma. Mobil Apple Pay ve Google Pay ile turlar arasında yükleme.",
          category: "Ürün",
        },
      },
    },
  },
  ja: {
    newsArticles: {
      editorialAuthor: "CrashX 編集部",
      backToNews: "ニュース一覧",
      readMore: "続きを読む",
      byAuthor: "{author}",
      footerBlurb:
        "プロダクトの更新、提携、プレイヤーガイドはニュースフィードでお知らせします。",
      items: {
        "trust-wallet-deposit": {
          title: "Trust WalletでCrash残高に入金",
          excerpt:
            "手順：USDTなどを追加して1分以内にCrashへ。",
          body:
            "CrashXはTrust Walletから複数ネットワークで直接入金に対応。入金ページで資産を選び、Trust WalletでQRを読み取ると、ネットワーク確認後に反映。USDT（TRC20）は平均30秒以内のことも。そのままCrashへ。",
          category: "ガイド",
        },
        "bank-card-deposit": {
          title: "Crashプレイヤー向けカード入金",
          excerpt:
            "VISA、Mastercard、Apple Pay、Google Payでチャージ — 残高へ即時換算。",
          body:
            "対象地域では銀行カードで法定通貨入金が可能。自動でUSDTに換算されCrashX残高へ。モバイルのApple Pay / Google Payでラウンドの合間にチャージ。",
          category: "プロダクト",
        },
      },
    },
  },
};

for (const [locale, patch] of Object.entries(locales)) {
  const fp = path.join(messagesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(fp, "utf8"));
  data.newsArticles = structuredClone(patch.newsArticles);
  fs.writeFileSync(fp, `${JSON.stringify(data, null, 2)}\n`);
}

console.log("Merged newsArticles");
