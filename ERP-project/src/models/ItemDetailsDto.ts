import type { ConnectorDto } from "./ConnectorDto";

export interface ItemDetailsDto {
  id: string | null;
  connector: ConnectorDto;
}