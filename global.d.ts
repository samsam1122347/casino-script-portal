/* eslint-disable @typescript-eslint/no-empty-object-type -- next-intl merges IntlMessages; extending the default bundle is intentional */
import type en from "./messages/en.json";

type AppMessages = typeof en;

declare global {
  interface IntlMessages extends AppMessages {}
}

export {};
