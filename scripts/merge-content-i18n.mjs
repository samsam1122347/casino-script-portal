/**
 * One-time merge: copies dashboard, faqSection, promotionsGrid, gameCard into each locale.
 * Run: node scripts/merge-content-i18n.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, "..", "messages");

/** @type {Record<string, Record<string, unknown>>} */
const locales = {
  de: {
    dashboard: {
      leaderboardTitle: "Bestenliste",
      thisWeek: "Diese Woche",
      tournamentsTitle: "Turniere",
      viewAll: "Alle anzeigen",
      prizePool: "Preispool",
      join: "Mitmachen",
      trustInstantTitle: "Sofortige Auszahlungen",
      trustInstantBody: "Auszahlung in Sekunden",
      trustFairTitle: "Nachweislich fair",
      trustFairBody: "100 % transparent",
      trustSecureTitle: "Sicher & vertrauenswürdig",
      trustSecureBody: "Deine Sicherheit hat Priorität",
      trustSupportTitle: "24/7-Support",
      trustSupportBody: "Wir sind für dich da",
      tournamentDailyTitle: "Daily Drop",
      tournamentDailyStatus: "Endet in 04:12:34",
      tournamentBattleTitle: "High Roller Battle",
      tournamentBattleStatus: "Endet in 12:12:34",
      tournamentWeekendTitle: "Weekend Showdown",
      tournamentWeekendStatus: "Start in 1d 04:12:34",
    },
    faqSection: {
      sectionTitle: "FAQ",
      "deposit-methods-q": "Welche Einzahlungsmethoden gibt es?",
      "deposit-methods-a":
        "CrashX akzeptiert BTC, ETH, USDT, USDC, BNB, TRX, SOL, TON und XRP. Bankkarten (VISA/Mastercard) sowie Apple Pay/Google Pay werden in berechtigten Regionen unterstützt und automatisch in USDT umgerechnet, damit du sofort auf Crash wetten kannst.",
      "claim-bonus-q": "Wie oft kann ich einen Bonus holen?",
      "claim-bonus-a":
        "Willkommensboni gelten einmal pro Konto. Reload- und Crash-Bestenlisten-Preise werden turnusmäßig neu gestellt — siehe Aktionen, was diese Woche für Crash gilt.",
      "verify-account-q": "Wie verifiziere ich meinen CrashX-Account?",
      "verify-account-a":
        "Gehe zu Profil → Verifizierung, folge den vier Schritten und lade die angeforderten Dokumente hoch. Die meisten Konten sind innerhalb von 24 Stunden verifiziert, damit du deine Crash-Limits erhöhen kannst.",
      "is-safe-q": "Ist CrashX sicher?",
      "is-safe-a":
        "CrashX operiert mit einer Curaçao-Lizenz. Crash-Ergebnisse nutzen nachweislich faire Seeds, die du prüfen kannst, und Gelder werden getrennt verwahrt.",
      "withdraw-q": "Wie zahle ich bei CrashX aus?",
      "withdraw-a":
        "Gehe zu Profil → Auszahlung, wähle Asset und Netzwerk, füge deine Wallet-Adresse ein und bestätige. On-Chain-Auszahlungen laufen nach erfolgreichen Crash-Session-Checks zügig.",
      "support-q": "Wie erreiche ich den Kundensupport?",
      "support-a":
        "Nutze den Live-Support auf jeder Seite. Wir antworten meist in wenigen Minuten, 24/7 — nenne bei Wettfragen gern die letzte Crash-Rundenzeit.",
    },
    promotionsGrid: {
      detailsLink: "Details",
      badgeDaily: "Täglich",
      badgeWeekly: "Wöchentlich",
      badgePartner: "Partner",
      "vip-cashback-title": "VIP-Cashback",
      "vip-cashback-desc":
        "Bis zu 25 % auf dein Crash-Volumen. Tägliche Auszahlung, keine Umsatzbedingung.",
      "race-title": "Crash-Bestenliste",
      "race-desc":
        "Erklimme die wöchentliche Crash-Rangliste — höchste ausbezahlte Multiplikator-Gewinne teilen einen Preispool.",
      "battle-x-title": "Crash-Duelle",
      "battle-x-desc":
        "Kopf an Kopf: Wer casht den höheren Multiplikator vor dem Bust?",
      "raffle-title": "Crash-Ticket-Verlosung",
      "raffle-desc":
        "Jede Woche Tickets durch Crash-Spielgewinne; Gewinner teilen Crypto-Preispakete.",
      "bonuses-title": "Crash-Boosts",
      "bonuses-desc":
        "Willkommens- und Reload-Boni für Crash — Eligibility siehst du auf der Einzahlungsseite.",
      "pragmatic-title": "Crash Drops",
      "pragmatic-desc":
        "Zufällige Drop-Preise während du Crash spielst — Achte auf Hinweise am Bildschirm.",
      "werder-title": "Werder Bremen",
      "werder-desc":
        "Offizieller Partner — Matchday-Crash-Codes und limitierte Merch-Drops für VIPs.",
      "multiplier-monday-title": "Multiplier Monday",
      "multiplier-monday-desc":
        "Erhöhte Min/Max-Multiplikatoren jeden Montag (UTC) — kombiniert mit VIP-Vorteilen.",
    },
    gameCard: { badgeHot: "Hot", badgeNew: "Neu" },
  },
  es: {
    dashboard: {
      leaderboardTitle: "Clasificación",
      thisWeek: "Esta semana",
      tournamentsTitle: "Torneos",
      viewAll: "Ver todo",
      prizePool: "Bote",
      join: "Entrar",
      trustInstantTitle: "Retiros instantáneos",
      trustInstantBody: "Pago en segundos",
      trustFairTitle: "Demostrablemente justo",
      trustFairBody: "100 % transparente",
      trustSecureTitle: "Seguro y fiable",
      trustSecureBody: "Tu seguridad es lo primero",
      trustSupportTitle: "Soporte 24/7",
      trustSupportBody: "Aquí estamos",
      tournamentDailyTitle: "Daily Drop",
      tournamentDailyStatus: "Termina en 04:12:34",
      tournamentBattleTitle: "High Roller Battle",
      tournamentBattleStatus: "Termina en 12:12:34",
      tournamentWeekendTitle: "Weekend Showdown",
      tournamentWeekendStatus: "Empieza en 1d 04:12:34",
    },
    faqSection: {
      sectionTitle: "FAQ",
      "deposit-methods-q": "¿Qué métodos de depósito hay?",
      "deposit-methods-a":
        "CrashX acepta BTC, ETH, USDT, USDC, BNB, TRX, SOL, TON y XRP. Tarjetas (VISA/Mastercard) y Apple Pay/Google Pay en regiones elegibles se convierten automáticamente a USDT para apostar al Crash al momento.",
      "claim-bonus-q": "¿Cuántas veces puedo reclamar un bono?",
      "claim-bonus-a":
        "Los bonos de bienvenida son una vez por cuenta. Recargas y premios de tabla de Crash se renuevan por calendario — mira Promociones para esta semana.",
      "verify-account-q": "¿Cómo verifico mi cuenta CrashX?",
      "verify-account-a":
        "Ve a Perfil → Verificación, sigue los cuatro pasos y sube los documentos. La mayoría se verifica en 24 horas para subir límites de Crash.",
      "is-safe-q": "¿CrashX es seguro?",
      "is-safe-a":
        "CrashX opera con licencia en Curaçao. Los resultados de Crash usan semillas demostrablemente justas y los fondos están segregados.",
      "withdraw-q": "¿Cómo retiro fondos de CrashX?",
      "withdraw-a":
        "Ve a Perfil → Retiro, elige activo y red, pega tu dirección y confirma. Los retiros on-chain son rápidos tras las comprobaciones de sesión.",
      "support-q": "¿Cómo contacto con soporte?",
      "support-a":
        "Usa Soporte en vivo en cualquier página. Respondemos en minutos, 24/7 — si es por una apuesta, indica la hora de la última ronda de Crash.",
    },
    promotionsGrid: {
      detailsLink: "Detalles",
      badgeDaily: "Diario",
      badgeWeekly: "Semanal",
      badgePartner: "Partner",
      "vip-cashback-title": "Cashback VIP",
      "vip-cashback-desc":
        "Hasta un 25 % sobre tu volumen de Crash. Pago diario, sin requisito de apuesta.",
      "race-title": "Tabla Crash",
      "race-desc":
        "Escala la tabla semanal de Crash — los multiplicadores cobrados más altos comparten bote.",
      "battle-x-title": "Duelos Crash",
      "battle-x-desc":
        "Rondas cara a cara: ¿quién cobra el multiplicador más alto antes del bust?",
      "raffle-title": "Sorteo de tickets Crash",
      "raffle-desc":
        "Gana tickets jugando Crash cada semana; los ganadores reparten paquetes en cripto.",
      "bonuses-title": "Impulsos Crash",
      "bonuses-desc":
        "Bonos de bienvenida y recarga para Crash — revisa elegibilidad en Depósito.",
      "pragmatic-title": "Crash Drops",
      "pragmatic-desc":
        "Premios drop aleatorios mientras juegas Crash — mira alertas en pantalla.",
      "werder-title": "Werder Bremen",
      "werder-desc":
        "Partner oficial — códigos Crash en partidos y merchandising limitado para VIP.",
      "multiplier-monday-title": "Multiplier Monday",
      "multiplier-monday-desc":
        "Multiplicadores min/máx reforzados cada lunes UTC — acumulable con perks VIP.",
    },
    gameCard: { badgeHot: "Hot", badgeNew: "Nuevo" },
  },
  fr: {
    dashboard: {
      leaderboardTitle: "Classement",
      thisWeek: "Cette semaine",
      tournamentsTitle: "Tournois",
      viewAll: "Tout voir",
      prizePool: "Cagnotte",
      join: "Rejoindre",
      trustInstantTitle: "Retraits instantanés",
      trustInstantBody: "Paiement en quelques secondes",
      trustFairTitle: "Prouvé équitable",
      trustFairBody: "100 % transparent",
      trustSecureTitle: "Sécurisé et fiable",
      trustSecureBody: "Votre sécurité d’abord",
      trustSupportTitle: "Support 24/7",
      trustSupportBody: "Nous sommes là",
      tournamentDailyTitle: "Daily Drop",
      tournamentDailyStatus: "Se termine dans 04:12:34",
      tournamentBattleTitle: "High Roller Battle",
      tournamentBattleStatus: "Se termine dans 12:12:34",
      tournamentWeekendTitle: "Weekend Showdown",
      tournamentWeekendStatus: "Commence dans 1j 04:12:34",
    },
    faqSection: {
      sectionTitle: "FAQ",
      "deposit-methods-q": "Quels moyens de dépôt sont disponibles ?",
      "deposit-methods-a":
        "CrashX accepte BTC, ETH, USDT, USDC, BNB, TRX, SOL, TON et XRP. Cartes bancaires (VISA/Mastercard) et Apple Pay/Google Pay dans les régions concernées sont convertis automatiquement en USDT pour parier sur Crash tout de suite.",
      "claim-bonus-q": "Combien de fois puis-je réclamer un bonus ?",
      "claim-bonus-a":
        "Le bonus de bienvenue est limité à une fois par compte. Recharges et classements Crash sont rafraîchis selon un calendrier — voir Promotions pour cette semaine.",
      "verify-account-q": "Comment vérifier mon compte CrashX ?",
      "verify-account-a":
        "Allez dans Profil → Vérification, suivez les quatre étapes et téléchargez les pièces. La plupart des comptes sont vérifiés sous 24 h pour augmenter les limites Crash.",
      "is-safe-q": "CrashX est-il sûr ?",
      "is-safe-a":
        "CrashX opère sous licence Curaçao. Les rounds Crash utilisent des graines vérifiables et les fonds sont séparés.",
      "withdraw-q": "Comment retirer des fonds de CrashX ?",
      "withdraw-a":
        "Profil → Retrait, choisissez l’actif et le réseau, collez l’adresse et confirmez. Les retraits on-chain sont rapides après les contrôles de session.",
      "support-q": "Comment contacter le support ?",
      "support-a":
        "Utilisez le support en direct sur chaque page. Réponse souvent en quelques minutes, 24/7 — pour un pari, indiquez l’heure de votre dernière manche Crash.",
    },
    promotionsGrid: {
      detailsLink: "Détails",
      badgeDaily: "Quotidien",
      badgeWeekly: "Hebdomadaire",
      badgePartner: "Partenaire",
      "vip-cashback-title": "Cashback VIP",
      "vip-cashback-desc":
        "Jusqu’à 25 % sur votre volume Crash. Versement quotidien, sans exigence de mise.",
      "race-title": "Classement Crash",
      "race-desc":
        "Grimpez au classement hebdo Crash — les plus gros multiplicateurs encaissés partagent la cagnotte.",
      "battle-x-title": "Duels Crash",
      "battle-x-desc":
        "Manches en tête-à-tête : qui encaisse le plus gros multiplicateur avant le bust ?",
      "raffle-title": "Tirage au sort Crash",
      "raffle-desc":
        "Gagnez des tickets en jouant au Crash chaque semaine ; les gagnants se partagent des lots crypto.",
      "bonuses-title": "Boosts Crash",
      "bonuses-desc":
        "Bonus de bienvenue et de rechargement adaptés au Crash — voir l’éligibilité sur Dépôt.",
      "pragmatic-title": "Crash Drops",
      "pragmatic-desc":
        "Des drops aléatoires pendant que vous jouez au Crash — surveillez les alertes à l’écran.",
      "werder-title": "Werder Brême",
      "werder-desc":
        "Partenaire officiel — codes Crash les jours de match et goodies limités VIP.",
      "multiplier-monday-title": "Multiplier Monday",
      "multiplier-monday-desc":
        "Multiplicateurs min/max rehaussés chaque lundi UTC — cumulable avec les avantages VIP.",
    },
    gameCard: { badgeHot: "Hot", badgeNew: "Nouveau" },
  },
  pt: {
    dashboard: {
      leaderboardTitle: "Leaderboard",
      thisWeek: "Esta semana",
      tournamentsTitle: "Torneios",
      viewAll: "Ver tudo",
      prizePool: "Prize pool",
      join: "Entrar",
      trustInstantTitle: "Levantamentos instantâneos",
      trustInstantBody: "Receba em segundos",
      trustFairTitle: "Provably fair",
      trustFairBody: "100% transparente",
      trustSecureTitle: "Seguro e confiável",
      trustSecureBody: "A sua segurança em primeiro lugar",
      trustSupportTitle: "Suporte 24/7",
      trustSupportBody: "Estamos aqui",
      tournamentDailyTitle: "Daily Drop",
      tournamentDailyStatus: "Termina em 04:12:34",
      tournamentBattleTitle: "High Roller Battle",
      tournamentBattleStatus: "Termina em 12:12:34",
      tournamentWeekendTitle: "Weekend Showdown",
      tournamentWeekendStatus: "Começa em 1d 04:12:34",
    },
    faqSection: {
      sectionTitle: "FAQ",
      "deposit-methods-q": "Quais métodos de depósito existem?",
      "deposit-methods-a":
        "A CrashX aceita BTC, ETH, USDT, USDC, BNB, TRX, SOL, TON e XRP. Cartões (VISA/Mastercard) e Apple Pay/Google Pay em regiões elegíveis convertem automaticamente para USDT para apostar no Crash na hora.",
      "claim-bonus-q": "Quantas vezes posso reclamar um bónus?",
      "claim-bonus-a":
        "Bónus de boas-vindas são uma vez por conta. Recargas e prémios de leaderboard do Crash renovam por calendário — ver Promoções para esta semana.",
      "verify-account-q": "Como verifico a minha conta CrashX?",
      "verify-account-a":
        "Vá a Perfil → Verificação, siga os quatro passos e envie os documentos. A maioria fica verificada em 24 horas para subir limites de Crash.",
      "is-safe-q": "A CrashX é segura?",
      "is-safe-a":
        "A CrashX opera com licença em Curaçao. Os resultados do Crash usam seeds comprovadamente justas e os fundos estão segregados.",
      "withdraw-q": "Como levanto fundos da CrashX?",
      "withdraw-a":
        "Perfil → Levantamento, escolha ativo e rede, cole o endereço e confirme. Levantamentos on-chain são rápidos após as verificações de sessão.",
      "support-q": "Como contacto o apoio?",
      "support-a":
        "Use o suporte ao vivo em qualquer página. Respondemos em minutos, 24/7 — para apostas, indique a hora da última ronda de Crash.",
    },
    promotionsGrid: {
      detailsLink: "Detalhes",
      badgeDaily: "Diário",
      badgeWeekly: "Semanal",
      badgePartner: "Parceiro",
      "vip-cashback-title": "Cashback VIP",
      "vip-cashback-desc":
        "Até 25% no seu volume de Crash. Pagamento diário, sem requisito de apostas.",
      "race-title": "Tabela Crash",
      "race-desc":
        "Suba na tabela semanal de Crash — os maiores multiplicadores levantados partilham o prize pool.",
      "battle-x-title": "Duelos Crash",
      "battle-x-desc":
        "Rondas frente a frente: quem levanta o maior multiplicador antes do bust?",
      "raffle-title": "Sorteio de bilhetes Crash",
      "raffle-desc":
        "Ganhe bilhetes ao jogar Crash; os vencedores repartem pacotes em cripto.",
      "bonuses-title": "Boosts Crash",
      "bonuses-desc":
        "Bónus de boas-vindas e recarga para Crash — veja elegibilidade em Depósito.",
      "pragmatic-title": "Crash Drops",
      "pragmatic-desc":
        "Prémios drop aleatórios enquanto joga Crash — veja alertas no ecrã.",
      "werder-title": "Werder Bremen",
      "werder-desc":
        "Parceiro oficial — códigos Crash em dias de jogo e merch limitado para VIPs.",
      "multiplier-monday-title": "Multiplier Monday",
      "multiplier-monday-desc":
        "Multiplicadores min/max reforçados todas as segundas-feiras UTC — acumula com perks VIP.",
    },
    gameCard: { badgeHot: "Hot", badgeNew: "Novo" },
  },
  ru: {
    dashboard: {
      leaderboardTitle: "Лидерборд",
      thisWeek: "На этой неделе",
      tournamentsTitle: "Турниры",
      viewAll: "Смотреть все",
      prizePool: "Призовой фонд",
      join: "Участвовать",
      trustInstantTitle: "Мгновенные выплаты",
      trustInstantBody: "Выплата за секунды",
      trustFairTitle: "Честная игра",
      trustFairBody: "100% прозрачность",
      trustSecureTitle: "Надёжно",
      trustSecureBody: "Безопасность прежде всего",
      trustSupportTitle: "Поддержка 24/7",
      trustSupportBody: "Мы на связи",
      tournamentDailyTitle: "Daily Drop",
      tournamentDailyStatus: "Заканчивается через 04:12:34",
      tournamentBattleTitle: "High Roller Battle",
      tournamentBattleStatus: "Заканчивается через 12:12:34",
      tournamentWeekendTitle: "Weekend Showdown",
      tournamentWeekendStatus: "Начнётся через 1д 04:12:34",
    },
    faqSection: {
      sectionTitle: "FAQ",
      "deposit-methods-q": "Какие способы депозита доступны?",
      "deposit-methods-a":
        "CrashX принимает BTC, ETH, USDT, USDC, BNB, TRX, SOL, TON и XRP. Карты (VISA/Mastercard) и Apple Pay/Google Pay в подходящих регионах автоматически конвертируются в USDT для ставок в Crash.",
      "claim-bonus-q": "Сколько раз можно получить бонус?",
      "claim-bonus-a":
        "Приветственный бонус — один раз на аккаунт. Reload и Crash-лидерборды обновляются по расписанию — см. Акции за эту неделю.",
      "verify-account-q": "Как верифицировать аккаунт CrashX?",
      "verify-account-a":
        "Профиль → Верификация, четыре шага и загрузка документов. Большинство аккаунтов за 24 часа — чтобы поднять лимиты Crash.",
      "is-safe-q": "Безопасен ли CrashX?",
      "is-safe-a":
        "CrashX работает по лицензии Кюрасао. Результаты Crash на provably fair-сидов, средства разделены.",
      "withdraw-q": "Как вывести средства из CrashX?",
      "withdraw-a":
        "Профиль → Вывод, выберите актив и сеть, вставьте адрес кошелька и подтвердите. On-chain после проверок сессии обрабатываются быстро.",
      "support-q": "Как связаться с поддержкой?",
      "support-a":
        "Живой чат на любой странице. Обычно отвечаем за минуты, 24/7 — по ставке укажите время последнего раунда Crash.",
    },
    promotionsGrid: {
      detailsLink: "Подробнее",
      badgeDaily: "Ежедневно",
      badgeWeekly: "Еженедельно",
      badgePartner: "Партнёр",
      "vip-cashback-title": "VIP-кэшбэк",
      "vip-cashback-desc":
        "До 25% с объёма Crash. Ежедневная выплата, без вейджера.",
      "race-title": "Таблица Crash",
      "race-desc":
        "Еженедельный Crash-лидерборд — крупнейшие выплаченные множители делят приз.",
      "battle-x-title": "Дуэли Crash",
      "battle-x-desc":
        "Лоб в лоб: кто заберёт больший множитель до вылета?",
      "raffle-title": "Розыгрыш билетов Crash",
      "raffle-desc":
        "Билеты за игру в Crash каждую неделю; победители делят крипто-призы.",
      "bonuses-title": "Бусты Crash",
      "bonuses-desc":
        "Приветственные и reload-бонусы под Crash — условия на странице депозита.",
      "pragmatic-title": "Crash Drops",
      "pragmatic-desc":
        "Случайные дропы во время Crash — следите за уведомлениями на экране.",
      "werder-title": "Вердер Бремен",
      "werder-desc":
        "Официальный партнёр — коды в матчевые дни и лимитированный мерч для VIP.",
      "multiplier-monday-title": "Multiplier Monday",
      "multiplier-monday-desc":
        "Повышенные min/max множители каждый понедельник UTC — вместе с VIP-привилегиями.",
    },
    gameCard: { badgeHot: "Хит", badgeNew: "Новинка" },
  },
  tr: {
    dashboard: {
      leaderboardTitle: "Liderlik tablosu",
      thisWeek: "Bu hafta",
      tournamentsTitle: "Turnuvalar",
      viewAll: "Tümünü gör",
      prizePool: "Ödül havuzu",
      join: "Katıl",
      trustInstantTitle: "Anında çekim",
      trustInstantBody: "Saniyeler içinde ödeme",
      trustFairTitle: "Kanıtlanabilir adil",
      trustFairBody: "%100 şeffaf",
      trustSecureTitle: "Güvenli",
      trustSecureBody: "Güvenliğiniz önce",
      trustSupportTitle: "7/24 destek",
      trustSupportBody: "Buradayız",
      tournamentDailyTitle: "Daily Drop",
      tournamentDailyStatus: "04:12:34 içinde biter",
      tournamentBattleTitle: "High Roller Battle",
      tournamentBattleStatus: "12:12:34 içinde biter",
      tournamentWeekendTitle: "Weekend Showdown",
      tournamentWeekendStatus: "1g 04:12:34 sonra başlar",
    },
    faqSection: {
      sectionTitle: "SSS",
      "deposit-methods-q": "Hangi yatırma yöntemleri var?",
      "deposit-methods-a":
        "CrashX BTC, ETH, USDT, USDC, BNB, TRX, SOL, TON ve XRP kabul eder. Uygun bölgelerde kart (VISA/Mastercard) ve Apple Pay/Google Pay otomatik USDT'ye çevrilir; Crash'e hemen bahis yapabilirsiniz.",
      "claim-bonus-q": "Bonusu kaç kez alabilirim?",
      "claim-bonus-a":
        "Hoş geldin bonusu hesap başına birdir. Reload ve Crash liderlik ödülleri takvime göre yenilenir — bu hafta için Promosyonlar'a bakın.",
      "verify-account-q": "CrashX hesabımı nasıl doğrularım?",
      "verify-account-a":
        "Profil → Doğrulama'ya gidin, dört adımı izleyin ve belgeleri yükleyin. Çoğu hesap 24 saat içinde onaylanır; Crash limitlerinizi yükseltirsiniz.",
      "is-safe-q": "CrashX güvenli mi?",
      "is-safe-a":
        "CrashX Curaçao lisansıyla çalışır. Crash sonuçları doğrulanabilir tohumlara dayanır; fonlar ayrı tutulur.",
      "withdraw-q": "CrashX'ten nasıl çekilir?",
      "withdraw-a":
        "Profil → Çekim, varlık ve ağı seçin, cüzdan adresini yapıştırıp onaylayın. Oturum kontrollerinden sonra zincir üstü çekimler hızlı işlenir.",
      "support-q": "Destek nasıl alınır?",
      "support-a":
        "Her sayfada Canlı Destek. Genelde dakikalar içinde yanıtlıyoruz, 7/24 — bahisle ilgiliyse son Crash turunuzun zamanını yazın.",
    },
    promotionsGrid: {
      detailsLink: "Detaylar",
      badgeDaily: "Günlük",
      badgeWeekly: "Haftalık",
      badgePartner: "Partner",
      "vip-cashback-title": "VIP cashback",
      "vip-cashback-desc":
        "Crash hacminizde %25'e kadar. Günlük ödeme, çevrim şartsız.",
      "race-title": "Crash sıralaması",
      "race-desc":
        "Haftalık Crash tablosuna çıkın — en yüksek nakde çevrilen çarpanlar ödül havuzunu paylaşır.",
      "battle-x-title": "Crash düelloları",
      "battle-x-desc":
        "Başa baş turlar: Patlamadan önce kim daha yüksek çarpanı nakde çevirir?",
      "raffle-title": "Crash bilet çekilişi",
      "raffle-desc":
        "Her hafta Crash oynayarak bilet kazanın; kazananlar kripto ödül paketlerini böler.",
      "bonuses-title": "Crash boostları",
      "bonuses-desc":
        "Hoş geldin ve reload bonusları Crash için — uygunluk Yatırım sayfasında.",
      "pragmatic-title": "Crash Drops",
      "pragmatic-desc":
        "Crash oynarken rastgele drop ödüller — ekrandaki uyarıları izleyin.",
      "werder-title": "Werder Bremen",
      "werder-desc":
        "Resmi partner — maç günü Crash kodları ve VIP'e sınırlı ürün.",
      "multiplier-monday-title": "Multiplier Monday",
      "multiplier-monday-desc":
        "Her Pazartesi UTC'de yükseltilmiş min/max çarpanlar — VIP avantajlarıyla birleşir.",
    },
    gameCard: { badgeHot: "Hot", badgeNew: "Yeni" },
  },
  ja: {
    dashboard: {
      leaderboardTitle: "リーダーボード",
      thisWeek: "今週",
      tournamentsTitle: "トーナメント",
      viewAll: "すべて表示",
      prizePool: "賞金プール",
      join: "参加",
      trustInstantTitle: "即時出金",
      trustInstantBody: "数秒で受取",
      trustFairTitle: "証明可能なフェアネス",
      trustFairBody: "100%透明",
      trustSecureTitle: "安全で信頼",
      trustSecureBody: "あなたの安全を最優先",
      trustSupportTitle: "24時間サポート",
      trustSupportBody: "いつでも対応",
      tournamentDailyTitle: "Daily Drop",
      tournamentDailyStatus: "終了まで 04:12:34",
      tournamentBattleTitle: "High Roller Battle",
      tournamentBattleStatus: "終了まで 12:12:34",
      tournamentWeekendTitle: "Weekend Showdown",
      tournamentWeekendStatus: "開始まで 1日 04:12:34",
    },
    faqSection: {
      sectionTitle: "FAQ",
      "deposit-methods-q": "入金方法は？",
      "deposit-methods-a":
        "CrashXはBTC、ETH、USDT、USDC、BNB、TRX、SOL、TON、XRPに対応。対象地域では銀行カード（VISA/Mastercard）やApple Pay/Google Payも自動でUSDT換算され、すぐCrashにベットできます。",
      "claim-bonus-q": "ボーナスは何回もらえる？",
      "claim-bonus-a":
        "ウェルカムボーナスはアカウントにつき一度。リロードやCrashリーダーボード賞はスケジュールで更新 — 今週はプロモーションをご確認ください。",
      "verify-account-q": "CrashXアカウントの認証方法は？",
      "verify-account-a":
        "プロフィール→認証で4ステップに従い書類をアップロード。多くの場合24時間以内に確認され、Crash上限を上げられます。",
      "is-safe-q": "CrashXは安全？",
      "is-safe-a":
        "キュラソーライセンスで運営。Crash結果は検証可能なシード、資金は分別管理です。",
      "withdraw-q": "出金の手順は？",
      "withdraw-a":
        "プロフィール→出金で資産とネットワークを選びウォレットアドレスを貼り付けて確認。セッション確認後、オンチェーン出金は迅速です。",
      "support-q": "サポートの連絡方法は？",
      "support-a":
        "どのページからもライブサポートへ。通常数分以内、24時間 — ベットについては最後のCrashラウンド時刻を添えてください。",
    },
    promotionsGrid: {
      detailsLink: "詳細",
      badgeDaily: "毎日",
      badgeWeekly: "毎週",
      badgePartner: "パートナー",
      "vip-cashback-title": "VIPキャッシュバック",
      "vip-cashback-desc":
        "Crash取引量の最大25%還元。毎日払い出し、賭け条件なし。",
      "race-title": "Crashランキング",
      "race-desc":
        "週間Crashリーダーボードを登る — 最も大きくキャッシュアウトした乗数が賞金プールを共有。",
      "battle-x-title": "Crashデュエル",
      "battle-x-desc":
        "直接対決 — バスト前に高い乗数を取るのはどちら？",
      "raffle-title": "Crashチケット抽選",
      "raffle-desc":
        "毎週Crashプレイでチケット獲得、当選者は暗号資産パッケージを分配。",
      "bonuses-title": "Crashブースト",
      "bonuses-desc":
        "Crash向けウェルカム＆リロードボーナス — 条件は入金ページで確認。",
      "pragmatic-title": "Crash Drops",
      "pragmatic-desc":
        "プレイ中ランダムドロップ — 画面アラートに注意。",
      "werder-title": "ヴェルダー・ブレーメン",
      "werder-desc":
        "公式パートナー — マッチデーCrashコードとVIP向け限定グッズ。",
      "multiplier-monday-title": "Multiplier Monday",
      "multiplier-monday-desc":
        "毎週月曜UTCにmin/max乗数アップ — VIP特典と併用可。",
    },
    gameCard: { badgeHot: "注目", badgeNew: "新着" },
  },
};

for (const [locale, patch] of Object.entries(locales)) {
  const fp = path.join(messagesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(fp, "utf8"));
  for (const key of ["dashboard", "faqSection", "promotionsGrid", "gameCard"]) {
    data[key] = structuredClone(patch[key]);
  }
  fs.writeFileSync(fp, `${JSON.stringify(data, null, 2)}\n`);
}

console.log("Merged dashboard, faqSection, promotionsGrid, gameCard into", Object.keys(locales).join(", "));
