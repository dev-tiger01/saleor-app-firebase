import { NextApiRequest } from "next";
import { toStringOrEmpty } from "./utils";
import { saleorApp } from "../saleor-app";

export const getAuthDataForRequest = async (request: NextApiRequest) => {
    //const logger = createLogger({}, { msgPrefix: "[getAuthDataForRequest] " });
  
    const saleorApiUrl = toStringOrEmpty(request.query.saleorApiUrl);
    // logger.info(`Got saleorApiUrl=${saleorApiUrl || "<undefined>"}`);
    if (!saleorApiUrl) {
      throw new Error("Missing saleorApiUrl query param");
    }
  
    const authData = await saleorApp.apl.get(saleorApiUrl);
    // logger.debug({ authData });
    if (!authData) {
      throw new Error(`APL for ${saleorApiUrl} not found`);
    }
  
    return authData;
  };