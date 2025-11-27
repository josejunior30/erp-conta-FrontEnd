import type { ConnectorDto } from "./ConnectorDto";

export interface ItemDetailsDto {
  id: string | null;
  connector: ConnectorDto;
  accounts: AccountBalanceDto[];

}

export interface AccountBalanceDto {
  id: string;
  name: string | null;
  type: AccountType | string;
  currencyCode: string | null; 
  balance: number | null; 
  availableBalance: number | null; 
}

export type AccountType =
  | "CHECKING"
  | "SAVINGS"
  | "CREDIT"
  | "LOAN"
  | "INVESTMENT"
  | "WALLET"
  | "OTHER";
