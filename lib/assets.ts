/**
 * Single source of truth for asset paths.
 * Every file lives under /public/assets/<group>/<name> (or /public roots for favicon set).
 *
 * Brand: `logo.png` → `/assets/brand/logo-full.png`. Favicon pack → `/favicon.ico`, PNG sizes,
 * and `/android-chrome-*` / `/apple-touch-icon.png`; `/assets/brand/mark-192.png` mirrors the PWA icon.
 */
export const assets = {
  brand: {
    /** Full raster Crash X logo (`logo.png`). */
    logoFull: "/assets/brand/logo-full.png",
    /** Square mark for header / small slots (aligned with favicon-io `android-chrome-192`). */
    mark: "/assets/brand/mark-192.png",
    appleTouch: "/apple-touch-icon.png",
    logo: "/assets/brand/logo-full.png",
    icon: "/assets/brand/mark-192.png",
  },
  avatars: {
    a9: "/assets/avatars/9.webp",
    a22: "/assets/avatars/22.webp",
    a51: "/assets/avatars/51.webp",
    a75: "/assets/avatars/75.webp",
    a96: "/assets/avatars/96.webp",
  },
  hero: {
    werder: "/assets/hero/werder.webp",
    rakebackBig: "/assets/hero/rakeback.webp",
    originalGames: "/assets/hero/originals.jpg",
    licensedSlots: "/assets/hero/licensed.jpg",
    vipCar: "/assets/hero/vip-car.webp",
    aboutHome: "/assets/hero/about-home.webp",
    supportGirl: "/assets/hero/support-girl.webp",
    supportBg: "/assets/hero/support-bg.webp",
    supportAvatars: "/assets/hero/support-avatars.webp",
    gift: "/assets/hero/gift.webp",
    rewardInfo: "/assets/hero/reward-info.webp",
    noMore: "/assets/hero/no-more.webp",
    pageAbout: "/assets/hero/page-about.webp",
    pagePromos: "/assets/hero/page-promos.webp",
    pageVip: "/assets/hero/page-vip.webp",
    pageFeedback: "/assets/hero/page-feedback.webp",
    pageLicenses: "/assets/hero/page-licenses.webp",
    pageNews: "/assets/hero/page-news.webp",
    pageSponsorships: "/assets/hero/page-sponsorships.webp",
    profileBg: "/assets/hero/profile-bg.webp",
  },
  crash: {
    background: "/assets/crash/background.jpg",
    chart: "/assets/crash/chart.webp",
    rocket: "/assets/crash/rocket.webp",
    icon: "/assets/crash/icon.webp",
    howToPlay: "/assets/crash/how-to-play.webp",
  },
  promotions: {
    rakeback: "/assets/promotions/rakeback.webp",
    race: "/assets/promotions/race.webp",
    battleX: "/assets/promotions/battle_x.webp",
    raffle: "/assets/promotions/raffle.webp",
    bonuses: "/assets/promotions/bonuses.webp",
    pragmatic: "/assets/promotions/pragmatic.webp",
    werder: "/assets/promotions/werder.webp",
    sevensix: "/assets/promotions/sevensix.webp",
  },
  sponsorships: {
    cryptoBg: "/assets/sponsorships/crypto-bg.webp",
    cryptoLogo: "/assets/sponsorships/crypto-logo.svg",
    ufc: "/assets/sponsorships/ufc.svg",
    werder: "/assets/sponsorships/werder.svg",
  },
  crypto: {
    btc: "/assets/crypto/btc.svg",
    eth: "/assets/crypto/eth.svg",
    usdt: "/assets/crypto/usdt.svg",
    usdc: "/assets/crypto/usdc.svg",
    bnb: "/assets/crypto/bnb.svg",
    trx: "/assets/crypto/trx.svg",
    sol: "/assets/crypto/sol.svg",
    ton: "/assets/crypto/ton.svg",
    xrp: "/assets/crypto/xrp.svg",
  },
  news: {
    deposit: "/assets/news/trust-wallet.webp",
    bankCard: "/assets/news/bank-card.webp",
    aspinall: "/assets/news/aspinall.webp",
  },
  games: {
    crash: "/assets/games/crash.webp",
    plinko: "/assets/games/plinko.webp",
    mines: "/assets/games/mines.webp",
    limbo: "/assets/games/limbo.webp",
    dice: "/assets/games/dice.webp",
    coinflip: "/assets/games/coinflip.webp",
    tower: "/assets/games/tower.webp",
    leMines: "/assets/games/le_mines.webp",
    dropTheBoss: "/assets/games/drop_the_boss.webp",
    mineDrop: "/assets/games/minedrop.webp",
    sweetBonanza: "/assets/games/sweet_bonanza_1000.webp",
    sugarRush: "/assets/games/sugar_rush_1000.webp",
    zeusVsHades: "/assets/games/zeus_vs_hades.webp",
    prayForThree: "/assets/games/pray_for_three.webp",
    fruitParty: "/assets/games/fruit_party_2.webp",
    frknBananas: "/assets/games/frkn_bananas.webp",
    dogHouse: "/assets/games/the_dog_house.webp",
    gatesOfOlympus: "/assets/games/gates_of_olympus.webp",
    starlightPrincess: "/assets/games/starlight_princess_1000.webp",
  },
  qr: {
    btc: "/assets/qr/btc.webp",
  },
  /** Landing grid preview loops (`/public/media`). */
  media: {
    landingPlayCrash: "/media/play-just.mp4",
    landingPromotions: "/media/promotion.mp4",
    landingVip: "/media/vip.mp4",
    sidebarMoonCrash: "/media/moon.mp4",
    /** Cinematic moon loops used by the home hero. */
    heroMoon: "/media/hero-moon.mp4",
    heroMoonAlt: "/media/hero-moon2.mp4",
    /** Looping animated wordmark/logo for header/footer lockups. */
    animatedLogo: "/media/animated-logo.mp4",
  },
} as const;
