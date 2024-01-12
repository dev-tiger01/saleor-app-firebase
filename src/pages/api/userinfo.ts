import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { createClient } from "../../lib/create-graphq-client";
import { keys } from "../../lib/utilMetadata";
import { CustomerCreateDocument, UserCreateInput, AccountErrorCode } from "../../../generated/graphql";
import { getAuthDataForRequest } from "../../lib/api-route-utils";
import FirebaseAdmin from "../../lib/firebase/firebaseAdmin";
import { Logger } from "aws-amplify";
import { createLogger } from "@saleor/apps-shared"

const loggerAws = new Logger('API userinfo', process.env.APP_LOG_LEVEL_AWS ?? 'INFO');
const logger = createLogger({
  service: "API userinfo",
});
interface DecodedToken {
  given_name?: string;
  family_name?: string;
  name?: string;
  email: string;
  sub: string;
  [key: string]: any;
}

function handleUserInfo(decodedToken: DecodedToken): DecodedToken {
  if (decodedToken.given_name && decodedToken.family_name) {
    // "given_name" and "family_name" properties already exist, no need to do anything.
    return decodedToken;
  }
  logger.info('Normalizing Firebase token')
  let given_name = '' 
  let family_name = '' 

  if (decodedToken.name) {
    try {
      const displayNameArray: string[] = JSON.parse(decodedToken.name);
      if (Array.isArray(displayNameArray) && displayNameArray.length >= 2) {
        given_name = displayNameArray[0];
        family_name = displayNameArray[1];
      }
    } catch (e) {
      const names: string[] = decodedToken.name.split(" ");
      given_name = names[0];
      family_name = names.slice(1).join(" ");
    }
  }

  return {...decodedToken, given_name, family_name}
}

const handler: NextApiHandler = async function (req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json({ "error": "Only GET method accepted." });
  }
  const authHeader = req.headers.authorization ?? '';
  
  logger.info(`Auth header: ${authHeader}`);
  // loggerAws.debug(`Authorization header: ${authHeader}`);
  
  const idToken = authHeader.split(" ")[1];
  if (!authHeader || typeof idToken === 'undefined') {
    return res.status(400).json({ "error": "Access token missing. Must be sent as 'Authorization: JWT <token>' in the request header" });
  }
  try {
    let tokenData: DecodedToken = { email: '', sub: '' };
    const authData = await getAuthDataForRequest(req);

    loggerAws.debug(JSON.stringify(authData))

    const client = createClient(authData.saleorApiUrl, async () => ({ token: authData.token }));

    const decodedToken = await FirebaseAdmin.auth().verifyIdToken(idToken);
    logger.info('Firebase token valid');
    // loggerAws.debug('Firebase token valid');
    tokenData = handleUserInfo(decodedToken as DecodedToken);
    loggerAws.debug(tokenData);
    logger.debug(tokenData);
    const { email, uid, given_name, family_name, phone_number } = tokenData;

    // check if customer exists
    // loggerAws.debug("Checking if customer exists...start")
    // const userQuery = await client.query(UserDocument, { email }).toPromise();
    
    // loggerAws.debug("Checking if customer exists...end")

    // Create user if it doesn't exist
    // if (!userQuery.data?.user) {
      logger.debug('Handling customer');
      loggerAws.debug('Handling customer');
      const input: UserCreateInput = {
        email: email,
        metadata: [{
          key: keys.phone,
          value: phone_number
        }],
        privateMetadata: [
          { key: keys.id, value: uid }
        ],
        firstName: given_name,
        lastName: family_name,
        isActive: true,
        isConfirmed: true
      };
      const { data, error } = await client.mutation(CustomerCreateDocument, { input }).toPromise();
      const errors = [error, ...(data?.customerCreate?.errors || [])].filter(Boolean);
      
      const unique = errors.filter((e: any) => e.code === AccountErrorCode.Unique) || []
      
      if (unique.length ) {
        logger.debug('Customer already exists');
        loggerAws.debug('Customer already exists');
      } else {
        if ( errors.length > 0 ) {
          logger.error(JSON.stringify(errors));
          throw new Error('Failed to create a customer');
        } else {
          logger.debug('Customer created');
          loggerAws.debug('Customer created');
        }
      }
      // loggerAws.debug('Customer created');
    // } else {
    //   logger.info('Customer already exists');
    //   // loggerAws.debug('Customer already exists');
    // }

    // Respond with decoded token
    logger.info(`Responding with decoded token: ${JSON.stringify(tokenData)}`);
    // loggerAws.debug(`Responding with decoded token: ${JSON.stringify(tokenData)}`);
    res.status(200).json(tokenData);
  } catch (error) {
    // Handle errors and respond accordingly
    loggerAws.error(JSON.stringify(error))
    logger.error('Failed to verify Firebase token.', error);
    // loggerAws.error('Failed to verify Firebase token.', error);
    res.status(401).json({ "error": error || "Failed to verify Firebase token." });
  }
};

export default handler;

// export const config = {
//   api: {
//     externalResolver: true,
//   },
// }