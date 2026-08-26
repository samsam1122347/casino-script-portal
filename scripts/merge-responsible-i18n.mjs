import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, "..", "messages");

/** @type {Record<string, Record<string, string>>} */
const rg = {
  de: {
    depositLimitsTitle: "Einzahlungslimits",
    depositLimitsBody:
      "Setze ein tägliches, wöchentliches oder monatliches Limit. Jederzeit unter Einstellungen anpassbar.",
    lossLimitsTitle: "Verlust- & Einsatzlimits",
    lossLimitsBody:
      "Sperre weitere Einsätze, sobald dein persönliches Limit erreicht ist.",
    timeoutTitle: "Auszeit",
    timeoutBody:
      "Pausiere dein Konto für 24 Stunden, 7 oder 30 Tage — ohne Begründung.",
    selfExclusionTitle: "Selbstausschluss",
    selfExclusionBody:
      "Schließe dein Konto dauerhaft. Der Selbstausschluss kann nicht rückgängig gemacht werden.",
    helpHeading: "Möchtest du mit jemandem sprechen?",
    helpIntro:
      "Wenn du oder jemand in deinem Umfeld Probleme mit Glücksspiel hat, gibt es weltweit kostenlose, vertrauliche Hilfe:",
  },
  es: {
    depositLimitsTitle: "Límites de depósito",
    depositLimitsBody:
      "Define un tope diario, semanal o mensual. Ajústalo cuando quieras en Ajustes.",
    lossLimitsTitle: "Límites de pérdida y apuesta",
    lossLimitsBody:
      "Bloquea nuevas apuestas al alcanzar tu límite personal.",
    timeoutTitle: "Tiempo fuera",
    timeoutBody:
      "Pausa tu cuenta 24 h, 7 o 30 días — sin preguntas.",
    selfExclusionTitle: "Autoexclusión",
    selfExclusionBody:
      "Cierra tu cuenta de forma permanente. La decisión no se revierte.",
    helpHeading: "¿Necesitas hablar con alguien?",
    helpIntro:
      "Si tú o alguien cercano tiene problemas con el juego, hay apoyo confidencial gratuito en todo el mundo:",
  },
  fr: {
    depositLimitsTitle: "Limites de dépôt",
    depositLimitsBody:
      "Fixez un plafond quotidien, hebdomadaire ou mensuel. Modifiable à tout moment dans les réglages.",
    lossLimitsTitle: "Limites de perte et de mise",
    lossLimitsBody:
      "Bloquez de nouvelles mises une fois votre plafond atteint.",
    timeoutTitle: "Pause",
    timeoutBody:
      "Suspendez votre compte pendant 24 h, 7 ou 30 jours — sans justification.",
    selfExclusionTitle: "Auto-exclusion",
    selfExclusionBody:
      "Fermez définitivement votre compte. Décision irrévocable.",
    helpHeading: "Besoin de parler à quelqu’un ?",
    helpIntro:
      "Si vous ou un proche rencontrez des difficultés avec le jeu, une aide confidentielle et gratuite existe dans le monde entier :",
  },
  pt: {
    depositLimitsTitle: "Limites de depósito",
    depositLimitsBody:
      "Defina um teto diário, semanal ou mensal. Ajuste quando quiser em Definições.",
    lossLimitsTitle: "Limites de perda e aposta",
    lossLimitsBody:
      "Bloqueie novas apostas ao atingir o seu limite pessoal.",
    timeoutTitle: "Pausa",
    timeoutBody:
      "Pause a sua conta por 24 h, 7 ou 30 dias — sem perguntas.",
    selfExclusionTitle: "Autoexclusão",
    selfExclusionBody:
      "Feche a conta de forma permanente. A decisão não é reversível.",
    helpHeading: "Precisa falar com alguém?",
    helpIntro:
      "Se você ou alguém próximo tem problemas com jogo, há apoio confidencial e gratuito em todo o mundo:",
  },
  ru: {
    depositLimitsTitle: "Лимиты депозита",
    depositLimitsBody:
      "Задайте дневной, недельный или месячный потолок. Меняйте в любой момент в настройках.",
    lossLimitsTitle: "Лимиты потерь и ставок",
    lossLimitsBody:
      "Блокируйте новые ставки после достижения личного лимита.",
    timeoutTitle: "Тайм-аут",
    timeoutBody:
      "Приостановите аккаунт на 24 часа, 7 или 30 дней — без вопросов.",
    selfExclusionTitle: "Самоисключение",
    selfExclusionBody:
      "Закройте аккаунт навсегда. Решение необратимо.",
    helpHeading: "Нужно поговорить с кем-то?",
    helpIntro:
      "Если у вас или близких проблемы с азартными играми, по всему миру есть бесплатная конфиденциальная помощь:",
  },
  tr: {
    depositLimitsTitle: "Yatırım limitleri",
    depositLimitsBody:
      "Günlük, haftalık veya aylık üst sınır belirleyin. Ayarlardan istediğiniz zaman değiştirin.",
    lossLimitsTitle: "Kayıp ve bahis limitleri",
    lossLimitsBody:
      "Kişisel limite ulaşınca yeni bahisleri kilitleyin.",
    timeoutTitle: "Mola",
    timeoutBody:
      "Hesabınızı 24 saat, 7 veya 30 gün askıya alın — soru sorulmaz.",
    selfExclusionTitle: "Kendi kendini dışlama",
    selfExclusionBody:
      "Hesabınızı kalıcı olarak kapatın. Bu karar geri alınamaz.",
    helpHeading: "Biriyle konuşmanız mı gerekiyor?",
    helpIntro:
      "Sizin veya tanıdığınızın kumar sorunu varsa dünya çapında ücretsiz ve gizli destek mevcut:",
  },
  ja: {
    depositLimitsTitle: "入金限度",
    depositLimitsBody:
      "1日／1週間／1ヶ月の上限を設定。設定からいつでも変更できます。",
    lossLimitsTitle: "損失・ベット限度",
    lossLimitsBody:
      "個人上限に達したら新規ベットを停止します。",
    timeoutTitle: "タイムアウト",
    timeoutBody:
      "24時間・7日・30日のアカウント停止が選べます。",
    selfExclusionTitle: "自己排除",
    selfExclusionBody:
      "アカウントを永久停止します。取り消しはできません。",
    helpHeading: "誰かに話したいですか？",
    helpIntro:
      "ご自身や周囲の方がギャンブルで苦しんでいる場合、世界中で無料の匿名サポートがあります:",
  },
};

for (const [locale, extra] of Object.entries(rg)) {
  const fp = path.join(messagesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(fp, "utf8"));
  data.responsibleGaming = {
    ...data.responsibleGaming,
    ...extra,
  };
  fs.writeFileSync(fp, `${JSON.stringify(data, null, 2)}\n`);
}

console.log("Merged responsible gaming tool strings");
