import { AuthData, AplReadyResult, AplConfiguredResult } from '@saleor/app-sdk/APL';
import { createLogger } from "@saleor/apps-shared";
import { Amplify, API, graphqlOperation, Logger } from 'aws-amplify';

function hasProp(obj:any, key: string) {
    return key != null && obj != null && typeof obj === "object" && key in obj;
}

var hasAuthData = (data: AuthData) => hasProp(data, "domain") && data.domain && hasProp(data, "token") && data.token && hasProp(data, "appId") && data.appId && hasProp(data, "saleorApiUrl") && data.saleorApiUrl;

const saleorLogger = createLogger({
    name: "AwsGraphQLAPL",
});

// Define the GraphQL queries and mutations to create or update auth data
const getAuthData = `
    query GetAuthData($saleorApiUrl: String!, $awsDomain: String!) {
        listAuthData(filter: {awsDomain: {eq: $awsDomain}, saleorApiUrl: {eq: $saleorApiUrl}}) {
            items {
                id
                appId
                domain
                saleorApiUrl
                token
                jwks
            }
        }
    }
`;

const getAllAuthData = `
    query GetAllAuthData($awsDomain: String!) {
        listAuthData(filter: {awsDomain: {eq: $awsDomain}}) {
            items {
                id
                appId
                domain
                saleorApiUrl
                token
                jwks
            }
        }
    }
`;

const getId = `
    query GetId($saleorApiUrl: String!, $awsDomain: String!) {
        listAuthData(filter: {awsDomain: {eq: $awsDomain}, saleorApiUrl: {eq: $saleorApiUrl}}) {
            items {
                id
            }
        }
    }
`;

const createAuthData = `
    mutation CreateAuthData($input: CreateAuthDataInput!) {
        createAuthData(input: $input) {
            id
        }
    }
`;

const updateAuthData = `
    mutation UpdateAuthData($input: UpdateAuthDataInput!) {
        updateAuthData(input: $input) {
            id
        }
    }
`;

const deleteAuthData = `
  mutation DeleteAuthData($input: DeleteAuthDataInput!) {
    deleteAuthData(input: $input) {
        id
    }
  }
`;

const awsLogger = new Logger('AwsGraphQLAPL', process.env.APP_LOG_LEVEL ?? 'info')

const AwsGraphQLAPL = class {
    private readonly appBaseUrl
    constructor (config: any, appBaseUrl: string) {
        this.appBaseUrl = appBaseUrl

        try {
            Amplify.configure(config);
        } catch (error) {
            const msg = `Error configuring Amplify. Error: ${JSON.stringify(error)}`
            
            awsLogger.debug(msg)
            saleorLogger.debug(msg)
            
            throw new Error(msg);
        }
    }
    async get(saleorApiUrl:string): Promise<AuthData | undefined> {
        let msg = `Getting authData. saleorApiUrl: ${saleorApiUrl}, awdDomain: ${this.appBaseUrl}`
        
        awsLogger.debug(msg)
        saleorLogger.debug(msg)

        try {
            const response = await API.graphql(graphqlOperation(getAuthData, { saleorApiUrl, awsDomain: this.appBaseUrl }))
            
            // @ts-ignore
            const authData = response.data.listAuthData.items[0]

            if (!hasAuthData(authData)) {
                return undefined
            }
            
            const msg = `AuthData successfully retrieved.`

            awsLogger.debug(msg)
            saleorLogger.debug(msg)

            return authData
        } catch (error) {
            const msg = `Error during getting the authData. Error: ${JSON.stringify(error)}`

            awsLogger.debug(msg)
            saleorLogger.debug(msg)

            throw new Error(msg);
        }
    }

    async set(authData:AuthData): Promise<undefined> {
        try {
            let msg = `Setting authData. saleorApiUrl: ${authData.saleorApiUrl}, awsDomain: ${this.appBaseUrl}.`

            awsLogger.debug(msg)
            saleorLogger.debug(msg)

            // Check if authData under saleorApiUrl and awsDomain exists already
            const response = await API.graphql(graphqlOperation(getId, { saleorApiUrl: authData.saleorApiUrl, awsDomain: this.appBaseUrl }))
            
            // @ts-ignore
            const id = response.data.listAuthData.items[0]?.id ?? ''
            
            if (id) {
                msg = `AuthData exists. ID=${id}`

                awsLogger.debug(msg)
                saleorLogger.debug(msg)
                await API.graphql(graphqlOperation(updateAuthData, { input: { id, ...authData, awsDomain: this.appBaseUrl }}));
            } else {
                msg = `AuthData doesn't exist. Creating new record.`

                awsLogger.debug(msg)
                saleorLogger.debug(msg)

                await API.graphql(graphqlOperation(createAuthData, { input: {...authData, awsDomain: this.appBaseUrl } }));
            }
        } catch (error) {
            let msg = `Error during saving the authData. Error: ${JSON.stringify(error)}}`

            awsLogger.debug(msg)
            saleorLogger.debug(msg)

            throw new Error(msg);
        }
        const msg = `authData successfully set for domain ${authData.domain} and Saleor instance ${authData.saleorApiUrl}`

        awsLogger.info(msg)
        saleorLogger.info(msg)

        return undefined;
    }

    async delete(saleorApiUrl:string): Promise<void> {
        try {
            let msg = 'Deleting authData'

            awsLogger.debug(msg)
            saleorLogger.debug(msg)
            const response = await API.graphql(graphqlOperation(getId, { saleorApiUrl, awsDomain: this.appBaseUrl }))

            // @ts-ignore
            const id = response.data.listAuthData.items[0]?.id ?? ''

            await API.graphql(graphqlOperation(deleteAuthData, { input: { id } }));
        } catch (error) {
            const msg = `Error during deleting the authData. Error: ${JSON.stringify(error)}`

            throw new Error(msg);
        }
        
        const msg = `AuthData successfully deleted for the Saleor instance: ${saleorApiUrl}`

        awsLogger.debug(msg)
        saleorLogger.debug(msg)
        
        return void 0;
    }

    async getAll(): Promise<AuthData[]> {
        let msg = 'Getting all authData'

        awsLogger.debug(msg)
        saleorLogger.debug(msg)
        try {
            const response = await API.graphql(graphqlOperation(getAllAuthData, { awsDomain: this.appBaseUrl }))

            const msg = `All authData successfully retrieved.`

            awsLogger.info(msg)
            saleorLogger.info(msg)

            // @ts-ignore
            return response.data.listAuthData.items
        } catch (error) {
            const msg = `Error during getting all authData. Error: ${JSON.stringify(error)}`

            awsLogger.debug(msg)
            saleorLogger.debug(msg)

            throw new Error(msg);
        }
    }

    async isReady(): Promise<AplReadyResult> {
        let msg = 'Checking if APL is ready'

        awsLogger.debug(msg)
        saleorLogger.debug(msg)
        
        const configured = await this.isConfigured();

        return configured ? {
          ready: true
        } : {
          ready: false,
          error: new Error("AwsGraphQLAPL is not configured")
        };
    }

    async isConfigured(): Promise<AplConfiguredResult> {
        // Implement logic to check if the APL is configured
        try {
            let msg = 'Checking if APL is configured'

            awsLogger.debug(msg)
            saleorLogger.debug(msg)
            
            const isConfigured = (Amplify && this.appBaseUrl) ? true : false; 

            if (isConfigured) {
                return { configured: true };
            } else {
                return { configured: false, error: new Error('AwsGraphQLAPL is not configured.') };
            }
        } catch (error) {
            return { configured: false, error: new Error('AwsGraphQLAPL is not ready.') };
        }
    }
}

export { AwsGraphQLAPL }