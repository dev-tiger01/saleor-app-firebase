import { APL, AuthData, AplReadyResult, AplConfiguredResult } from '@saleor/app-sdk/APL';

type AwsAuthData = AuthData & {
  awsDomain: string;
}

type GetAllAplResponseShape = {
  count: number;
  results: AwsAuthData[];
};
/**
 *
 * AWS GraphQL APL - handle auth data management via AWS GraphQL.
 *
 * Required configuration options:
 * - `resourceUrl` URL to the REST API
 * - `token` Authorization token assigned to your deployment
 *
 */
declare class AwsGraphQL implements APL {
  private readonly appBaseUrl;
  constructor(config: any, appBaseUrl: string);
  private getUrlForDomain;
  get(saleorApiUrl: string): Promise<AwsAuthData | undefined>;
  set(authData: AuthData): Promise<undefined>;
  delete(saleorApiUrl: string): Promise<void>;
  getAll(): Promise<AwsAuthData[]>;
  isReady(): Promise<AplReadyResult>;
  isConfigured(): Promise<AplConfiguredResult>;
}