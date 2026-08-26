import { assets } from "../assets";
import type { Partner } from "../types";

export const partners: Partner[] = [
  {
    id: "werder-bremen",
    name: "Werder Bremen",
    logo: assets.sponsorships.werder,
    background: assets.hero.werder,
  },
  {
    id: "crypto-com",
    name: "Crypto.com",
    logo: assets.sponsorships.cryptoLogo,
    background: assets.sponsorships.cryptoBg,
  },
  {
    id: "ufc",
    name: "UFC",
    logo: assets.sponsorships.ufc,
    background: assets.hero.werder,
  },
];
