export type TenantCryptoAsset = {
  id: string;
  symbol: string;
  name: string;
  network: string;
  address: string;
  icon_key?: string;
  min_deposit_usd?: number;
  min_withdraw_usd?: number;
};
