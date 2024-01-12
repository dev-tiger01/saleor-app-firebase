import { APL, FileAPL, SaleorCloudAPL, UpstashAPL } from "@saleor/app-sdk/APL";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";
import { AwsGraphQLAPL } from "@ecomm/APL";
import awsconfig from '../aws-exports';

const aplType = process.env.APL ?? "file";

export let apl: APL;

switch (aplType) {
  case "aws-graphql": 
    if (!process.env.APP_API_BASE_URL) {
      throw new Error("APP_API_BASE_URL is not configured - missing env variables. Check saleor-app.ts");
    }
    apl = new AwsGraphQLAPL(awsconfig, process.env.APP_API_BASE_URL);

    break;
  case "upstash":
    apl = new UpstashAPL();

    break;
  case "file":
    apl = new FileAPL();

    break;
  case "saleor-cloud": {
    if (!process.env.REST_APL_ENDPOINT || !process.env.REST_APL_TOKEN) {
      throw new Error("Rest APL is not configured - missing env variables. Check saleor-app.ts");
    }

    apl = new SaleorCloudAPL({
      resourceUrl: process.env.REST_APL_ENDPOINT,
      token: process.env.REST_APL_TOKEN,
    });

    break;
  }
  default: {
    throw new Error("Invalid APL config, ");
  }
}
export const saleorApp = new SaleorApp({
  apl,
});

export const REQUIRED_SALEOR_VERSION = ">=3.11.7 <4";
