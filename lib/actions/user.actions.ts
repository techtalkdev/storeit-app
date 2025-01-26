"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";

const getUserByEmail = async (email: string) => {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("email", [email])],
    );

    return result.total > 0 ? result.documents[0] : null;
};
const handleError = (error: unknown, message: string)  => {
    console.log(error, message);
    throw error;
} 

const sendEmailOTP = async ({ email } : { email: string }) => {
    const { account } = await createAdminClient();

    try {
        const session = await account.createEmailToken(ID.unique(), email);

        return session.userId;
    } catch (error) {
        handleError(error, "Failed to send email OTP"); 
    }
}

export const createAccount = async ({ fullName, email }: { fullName: string, email: string }) => {
    const existingUser = await getUserByEmail(email);

    const accountId = await sendEmailOTP({ email });
    if (!accountId) throw new Error("Failed to send an OTP");

    if(!existingUser) {
        const { databases } = await createAdminClient();

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            ID.unique(),
            {
                fullName,
                email,
                avatar: "data:image/png;base64,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",
                accountId,
            }
        )
    }

    return parseStringify({ accountId });

}
