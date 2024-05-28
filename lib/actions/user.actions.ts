'use server'

import { ID } from "node-appwrite"
import { createAdminClient, createSessionClient } from "../appwrite"
import { cookies } from "next/headers"
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils"
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid"
import { plaidClient } from "../plaid"
import { revalidatePath } from "next/cache"
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions"

export const signIn = async (userData: SignInParams) => {
    const { email, password } = userData;

    try {
        const { account } = await createAdminClient();

        const session = await account.createEmailPasswordSession(email, password);

        return parseStringify(session);
    } catch (error) {
        console.error("Error", error)
    }
}

export const signUp = async (userData: SignUpParams) => {
    const { email, firstName, password, lastName} = userData;

    let newUserAccount;
    
    try {
        
        const { account, database } = await createAdminClient();

        newUserAccount = await account.create(
            ID.unique(), 
            email, 
            password,
            `${firstName} ${lastName}`
        );

        if(!newUserAccount) throw new Error('Error creating user')

        const dwollaUser = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            address1: userData.address,
            city: userData.city,
            state: userData.state,
            postalCode: userData.pincode,
            dateOfBirth: userData.dob,
            ssn: userData.aadhar
        }

        const dwollaCustomerUrl = await createDwollaCustomer({
            ...dwollaUser,
            type: 'personal'
        });

        if(!dwollaCustomerUrl) throw new Error('Error creating Dwolla customer')
        
        const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

        const newUser = await database.createDocument(
            process.env.APPWRITE_DATABASE_ID!,
            process.env.APPWRITE_USER_COLLECTION_ID!,
            ID.unique(),
            {
              ...userData,
              userId: newUserAccount.$id,
              dwollaCustomerId,
              dwollaCustomerUrl
            })

        const session = await account.createEmailPasswordSession(email, password);

        cookies().set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });



        return parseStringify(newUser);

    } catch (error) {
        console.error("Error", error)
    }
}

export async function getLoggedInUser() {
    try {
      const { account } = await createSessionClient();
      const user = await account.get();
    //   return user;
      return parseStringify(user);
    } catch (error) {
      return null;
    }
  }

export const logoutAccount = async () => {
    try {
        const  { account } = await createSessionClient();

        cookies().delete('appwrite-session');

        await account.deleteSession('current');
    } catch (error) {
        return null
    }
}

export const createLinkToken = async (user: User) => {
    try {
        const tokenParams = {
            user: {
                client_user_id : user.$id,
            },
            client_name: `${user.firstName}${user.lastName}`,
            products: ['auth'] as Products[],
            language: 'en',
            country_codes: ['US'] as CountryCode[],
        }

        const response = await plaidClient.linkTokenCreate(tokenParams);

        return parseStringify({ linkToken: response.data.link_token })

    } catch (error) {
        console.log(error)
    }
}

export const createBankAccount = async({
    userId,
    bankId,
    accountId,
    accessToken,
    fundingSourceUrl,
    sharableId,
}: createBankAccountProps) => {
    try {
        const { database } = await createAdminClient();

        const bankAccount = await database.createDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_BANK_COLLECTION_ID!,
        ID.unique(),
        {
            userId,
            bankId,
            accountId,
            accessToken,
            fundingSourceUrl,
            sharableId,
        })

        return parseStringify(bankAccount);
    } catch (error) {
        console.log("DB error while account creation: ", error);
    }
}

export const exchangePublicToken = async ({ 
    publicToken,
    user 
}: exchangePublicTokenProps) => {
    try {
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });
      
        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;
          
        // Get account information from Plaid using the access token
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });
      
        const accountData = accountsResponse.data.accounts[0];

          // Create a processor token for Dwolla using the access token and account ID
        const request: ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
        };
  
        const processorTokenResponse = await plaidClient.processorTokenCreate(request);
        const processorToken = processorTokenResponse.data.processor_token;

        // Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerId: user.dwollaCustomerId,
            processorToken,
            bankName: accountData.name,
        });

        if (!fundingSourceUrl) throw Error;

        await createBankAccount({
            userId: user.$id,
            bankId: itemId,
            accountId: accountData.account_id,
            accessToken,
            fundingSourceUrl,
            sharableId: encryptId(accountData.account_id),
        });

        revalidatePath('/');

        return parseStringify({
            publicTokenExchange: 'Complete'
        });

    } catch (error) {
        console.log("An error occurred while creating exchanging token: ", error);
    }
}