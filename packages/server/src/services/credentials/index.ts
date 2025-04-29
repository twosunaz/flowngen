import { omit } from 'lodash'
import { StatusCodes } from 'http-status-codes'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { Credential } from '../../database/entities/Credential'
import { transformToCredentialEntity, decryptCredentialData } from '../../utils'
import { ICredentialReturnResponse } from '../../Interface'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'

const createCredential = async (requestBody: any, userId: string) => {
    try {
        const appServer = getRunningExpressApp()
        const newCredential = await transformToCredentialEntity(requestBody)

        // 🧠 Set userId
        newCredential.userId = userId

        const credential = await appServer.AppDataSource.getRepository(Credential).create(newCredential)
        const dbResponse = await appServer.AppDataSource.getRepository(Credential).save(credential)
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: credentialsService.createCredential - ${getErrorMessage(error)}`
        )
    }
}

// Delete all credentials from chatflowid
const deleteCredentials = async (credentialId: string, userId: string): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(Credential).delete({
            id: credentialId,
            userId: userId
        })
        if (!dbResponse.affected) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Credential ${credentialId} not found or unauthorized`)
        }
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: credentialsService.deleteCredential - ${getErrorMessage(error)}`
        )
    }
}

const getAllCredentials = async (paramCredentialName: any, userId: string) => {
    try {
        const appServer = getRunningExpressApp()
        let dbResponse = []

        if (paramCredentialName) {
            if (Array.isArray(paramCredentialName)) {
                for (let i = 0; i < paramCredentialName.length; i += 1) {
                    const name = paramCredentialName[i] as string
                    const credentials = await appServer.AppDataSource.getRepository(Credential).findBy({
                        credentialName: name,
                        userId: userId
                    })
                    dbResponse.push(...credentials)
                }
            } else {
                const credentials = await appServer.AppDataSource.getRepository(Credential).findBy({
                    credentialName: paramCredentialName as string,
                    userId: userId
                })
                dbResponse = [...credentials]
            }
        } else {
            const credentials = await appServer.AppDataSource.getRepository(Credential).findBy({
                userId: userId
            })
            for (const credential of credentials) {
                dbResponse.push(omit(credential, ['encryptedData']))
            }
        }

        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: credentialsService.getAllCredentials - ${getErrorMessage(error)}`
        )
    }
}

const getCredentialById = async (credentialId: string, userId: string): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()

        // 🧠 Query with userId
        const credential = await appServer.AppDataSource.getRepository(Credential).findOneBy({
            id: credentialId,
            userId: userId
        })

        if (!credential) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Credential ${credentialId} not found or unauthorized`)
        }

        // ✅ Decrypt credential data
        const decryptedCredentialData = await decryptCredentialData(
            credential.encryptedData,
            credential.credentialName,
            appServer.nodesPool.componentCredentials
        )

        const returnCredential: ICredentialReturnResponse = {
            ...credential,
            plainDataObj: decryptedCredentialData
        }

        // ✅ Return decrypted data with encryptedData omitted
        const dbResponse = omit(returnCredential, ['encryptedData'])
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: credentialsService.getCredentialById - ${getErrorMessage(error)}`
        )
    }
}

const updateCredential = async (credentialId: string, requestBody: any, userId: string): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()

        // 🛡 Find credential with userId check
        const credential = await appServer.AppDataSource.getRepository(Credential).findOneBy({
            id: credentialId,
            userId: userId
        })

        if (!credential) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Credential ${credentialId} not found or unauthorized`)
        }

        // 🔐 Decrypt and merge new data
        const decryptedCredentialData = await decryptCredentialData(credential.encryptedData)
        requestBody.plainDataObj = { ...decryptedCredentialData, ...requestBody.plainDataObj }

        const updateCredential = await transformToCredentialEntity(requestBody)

        appServer.AppDataSource.getRepository(Credential).merge(credential, updateCredential)
        const dbResponse = await appServer.AppDataSource.getRepository(Credential).save(credential)

        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: credentialsService.updateCredential - ${getErrorMessage(error)}`
        )
    }
}

export default {
    createCredential,
    deleteCredentials,
    getAllCredentials,
    getCredentialById,
    updateCredential
}
