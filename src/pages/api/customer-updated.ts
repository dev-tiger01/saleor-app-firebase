import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { CustomerUpdated, CustomerUpdatedDocument } from "../../../generated/graphql";
import { saleorApp } from "../../saleor-app";
import FirebaseAdmin from "../../lib/firebase/firebaseAdmin";
import { createLogger } from "@saleor/apps-shared"
import { keys } from "../../lib/utilMetadata";

const logger = createLogger({
  service: "Webhook customer updated",
});

export var webhookCustomerUpdated = new SaleorAsyncWebhook<CustomerUpdated>({
  name: "Customer updated in Saleor",
  webhookPath: "api/customer-updated",
  event: "CUSTOMER_UPDATED",
  apl: saleorApp.apl,
  query: CustomerUpdatedDocument,
  /**
   * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
   */
  isActive: true
});

/**
 * Export decorated Next.js handler, which adds extra context
 */
export default webhookCustomerUpdated.createHandler((req, res, ctx) => {
  const { payload } = ctx;

  logger.info(`Received customer updated payload`);
  logger.debug(`Payload: ${JSON.stringify(payload)}`);
  
  const { firstName='', lastName=''} = payload.user ?? {};
  const uid = payload.user?.privateMetafields[keys.id];
  
  logger.info(`Updating Firebase user ${uid} with name ${firstName} ${lastName}`);
  
  FirebaseAdmin
    .auth()
    .updateUser(uid, {
      displayName: JSON.stringify([firstName, lastName])
    })
    .catch(e => {
      logger.error(`Failed to update Firebase user ${uid} with name ${firstName} ${lastName}`);
      logger.error(e);
      return res.status(400).end();
    })

  return res.status(200).end();
});

/**
 * Disable body parser for this endpoint, so signature can be verified
 */
export const config = {
  api: {
    bodyParser: false,
  },
};