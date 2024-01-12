import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";
import packageJson from "../../../package.json";
import { webhookCustomerUpdated } from "./customer-updated";

/**
 * App SDK helps with the valid Saleor App Manifest creation. Read more:
 * https://github.com/saleor/saleor-app-sdk/blob/main/docs/api-handlers.md#manifest-handler-factory
 */
export default createManifestHandler({
  async manifestFactory({ appBaseUrl }) {
    /**
     * Allow to overwrite default app base url, to enable Docker support.
     *
     * See docs: TODO
     */
    const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseURL = process.env.APP_API_BASE_URL ?? appBaseUrl;

    const manifest: AppManifest = {
      name: 'Firebase',
      about: 'Authenticates users with Firebase.',
      tokenTargetUrl: `${apiBaseURL}/api/register`,
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      appUrl: iframeBaseUrl,
      /**
       * Set permissions for app if needed
       * https://docs.saleor.io/docs/3.x/developer/permissions
       */
      permissions: [
        /**
         * Add permission to allow "ORDER_CREATED" webhook registration.
         *
         * This can be removed
         */
        "MANAGE_STAFF", "MANAGE_USERS"
      ],
      id: "saleor.app.firebase",
      version: packageJson.version,
      /**
       * Configure webhooks here. They will be created in Saleor during installation
       * Read more
       * https://docs.saleor.io/docs/3.x/developer/api-reference/webhooks/objects/webhook
       *
       * Easiest way to create webhook is to use app-sdk
       * https://github.com/saleor/saleor-app-sdk/blob/main/docs/saleor-webhook.md
       */
      // webhooks: [webhookCustomerUpdated.getWebhookManifest(apiBaseURL)],
      /**
       * Optionally, extend Dashboard with custom UIs
       * https://docs.saleor.io/docs/3.x/developer/extending/apps/extending-dashboard-with-apps
       */
      // extensions: [],
      author: "Aarini",
      brand: {
        logo: {
          default: `${apiBaseURL}/logo.png`,
        },
      },
    };

    return manifest;
  },
});