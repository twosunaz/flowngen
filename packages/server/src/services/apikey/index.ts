import { StatusCodes } from 'http-status-codes'
import {
    addAPIKey as addAPIKey_json,
    deleteAPIKey as deleteAPIKey_json,
    generateAPIKey,
    generateSecretHash,
    getApiKey as getApiKey_json,
    getAPIKeys as getAPIKeys_json,
    updateAPIKey as updateAPIKey_json,
    replaceAllAPIKeys as replaceAllAPIKeys_json,
    importKeys as importKeys_json
} from '../../utils/apiKey'
import { addChatflowsCount } from '../../utils/addChatflowsCount'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { ApiKey } from '../../database/entities/ApiKey'
import { appConfig } from '../../AppConfig'
import { randomBytes } from 'crypto'
import { Not, IsNull } from 'typeorm'

const _apikeysStoredInJson = (): boolean => {
    return appConfig.apiKeys.storageType === 'json'
}

const _apikeysStoredInDb = (): boolean => {
    return appConfig.apiKeys.storageType === 'db'
}

const getAllApiKeys = async (userId: string) => {
    try {
        if (_apikeysStoredInJson()) {
            const keys = await getAPIKeys_json()
            return await addChatflowsCount(keys)
        } else if (_apikeysStoredInDb()) {
            const appServer = getRunningExpressApp()

            // 🧠 Scope by userId
            let keys = await appServer.AppDataSource.getRepository(ApiKey).find({
                where: { userId }
            })

            if (keys.length === 0) {
                await createApiKey('DefaultKey', userId)

                // re-fetch scoped
                keys = await appServer.AppDataSource.getRepository(ApiKey).find({
                    where: { userId }
                })
            }

            return await addChatflowsCount(keys)
        } else {
            throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `UNKNOWN APIKEY_STORAGE_TYPE`)
        }
    } catch (error) {
        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: apikeyService.getAllApiKeys - ${getErrorMessage(error)}`)
    }
}

const getApiKey = async (apiKey: string) => {
    try {
        if (_apikeysStoredInJson()) {
            return getApiKey_json(apiKey)
        } else if (_apikeysStoredInDb()) {
            const appServer = getRunningExpressApp()
            const currentKey = await appServer.AppDataSource.getRepository(ApiKey).findOneBy({
                apiKey: apiKey
            })
            if (!currentKey) {
                return undefined
            }
            return currentKey
        } else {
            throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `UNKNOWN APIKEY_STORAGE_TYPE`)
        }
    } catch (error) {
        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: apikeyService.createApiKey - ${getErrorMessage(error)}`)
    }
}

const createApiKey = async (keyName: string, userId: string) => {
    try {
        if (_apikeysStoredInJson()) {
            const keys = await addAPIKey_json(keyName)
            return await addChatflowsCount(keys)
        } else if (_apikeysStoredInDb()) {
            const apiKey = generateAPIKey()
            const apiSecret = generateSecretHash(apiKey)
            const appServer = getRunningExpressApp()

            const newKey = new ApiKey()
            newKey.id = randomBytes(16).toString('hex')
            newKey.apiKey = apiKey
            newKey.apiSecret = apiSecret
            newKey.keyName = keyName
            newKey.userId = userId // 🧠 Critical new line

            const key = appServer.AppDataSource.getRepository(ApiKey).create(newKey)
            await appServer.AppDataSource.getRepository(ApiKey).save(key)

            return getAllApiKeys(userId)
        } else {
            throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `UNKNOWN APIKEY_STORAGE_TYPE`)
        }
    } catch (error) {
        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: apikeyService.createApiKey - ${getErrorMessage(error)}`)
    }
}

const updateApiKey = async (id: string, keyName: string, userId: string) => {
    try {
        if (_apikeysStoredInJson()) {
            const keys = await updateAPIKey_json(id, keyName)
            return await addChatflowsCount(keys)
        } else if (_apikeysStoredInDb()) {
            const appServer = getRunningExpressApp()

            // 🧠 Find by both id and userId
            const currentKey = await appServer.AppDataSource.getRepository(ApiKey).findOneBy({
                id: id,
                userId: userId
            })

            if (!currentKey) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `ApiKey ${id} not found or unauthorized`)
            }

            currentKey.keyName = keyName
            await appServer.AppDataSource.getRepository(ApiKey).save(currentKey)

            return getAllApiKeys(userId)
        } else {
            throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `UNKNOWN APIKEY_STORAGE_TYPE`)
        }
    } catch (error) {
        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: apikeyService.updateApiKey - ${getErrorMessage(error)}`)
    }
}

const deleteApiKey = async (id: string, userId: string) => {
    try {
        if (_apikeysStoredInJson()) {
            const keys = await deleteAPIKey_json(id)
            return await addChatflowsCount(keys)
        } else if (_apikeysStoredInDb()) {
            const appServer = getRunningExpressApp()

            // 🧠 Secure delete by id + userId
            const dbResponse = await appServer.AppDataSource.getRepository(ApiKey).delete({
                id: id,
                userId: userId
            })

            if (!dbResponse.affected || dbResponse.affected === 0) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `ApiKey ${id} not found or unauthorized`)
            }

            return getAllApiKeys(userId)
        } else {
            throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `UNKNOWN APIKEY_STORAGE_TYPE`)
        }
    } catch (error) {
        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: apikeyService.deleteApiKey - ${getErrorMessage(error)}`)
    }
}

const importKeys = async (body: any, userId: string) => {
    try {
        const jsonFile = body.jsonFile
        const splitDataURI = jsonFile.split(',')
        if (splitDataURI[0] !== 'data:application/json;base64') {
            throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Invalid dataURI`)
        }

        const bf = Buffer.from(splitDataURI[1] || '', 'base64')
        const plain = bf.toString('utf8')
        const keys = JSON.parse(plain)

        if (_apikeysStoredInJson()) {
            if (body.importMode === 'replaceAll') {
                await replaceAllAPIKeys_json(keys)
            } else {
                await importKeys_json(keys, body.importMode)
            }
            return await addChatflowsCount(keys)
        } else if (_apikeysStoredInDb()) {
            const appServer = getRunningExpressApp()
            const allApiKeys = await appServer.AppDataSource.getRepository(ApiKey).find()

            if (body.importMode === 'replaceAll') {
                await appServer.AppDataSource.getRepository(ApiKey).delete({
                    id: Not(IsNull())
                })
            }

            if (body.importMode === 'errorIfExist') {
                for (const key of keys) {
                    const keyNameExists = allApiKeys.find((k) => k.keyName === key.keyName)
                    if (keyNameExists) {
                        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Key with name ${key.keyName} already exists`)
                    }
                }
            }

            for (const key of keys) {
                const keyNameExists = allApiKeys.find((k) => k.keyName === key.keyName)
                if (keyNameExists) {
                    const keyIndex = allApiKeys.findIndex((k) => k.keyName === key.keyName)
                    switch (body.importMode) {
                        case 'overwriteIfExist': {
                            const currentKey = allApiKeys[keyIndex]
                            currentKey.id = key.id
                            currentKey.apiKey = key.apiKey
                            currentKey.apiSecret = key.apiSecret
                            currentKey.keyName = key.keyName
                            currentKey.userId = userId // 🧠 Fix overwriting keys too!
                            await appServer.AppDataSource.getRepository(ApiKey).save(currentKey)
                            break
                        }
                        case 'ignoreIfExist': {
                            continue
                        }
                        case 'errorIfExist': {
                            throw new Error(`Key with name ${key.keyName} already exists`)
                        }
                        default: {
                            throw new Error(`Unknown overwrite option ${body.importMode}`)
                        }
                    }
                } else {
                    const newKey = new ApiKey()
                    newKey.id = key.id
                    newKey.apiKey = key.apiKey
                    newKey.apiSecret = key.apiSecret
                    newKey.keyName = key.keyName
                    newKey.userId = userId // 🧠 Critical assignment!

                    const newKeyEntity = appServer.AppDataSource.getRepository(ApiKey).create(newKey)
                    await appServer.AppDataSource.getRepository(ApiKey).save(newKeyEntity)
                }
            }

            return getAllApiKeys(userId)
        } else {
            throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `UNKNOWN APIKEY_STORAGE_TYPE`)
        }
    } catch (error) {
        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: apikeyService.importKeys - ${getErrorMessage(error)}`)
    }
}

const verifyApiKey = async (paramApiKey: string): Promise<string> => {
    try {
        if (_apikeysStoredInJson()) {
            const apiKey = await getApiKey_json(paramApiKey)
            if (!apiKey) {
                throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, `Unauthorized`)
            }
            return 'OK'
        } else if (_apikeysStoredInDb()) {
            const appServer = getRunningExpressApp()
            const apiKey = await appServer.AppDataSource.getRepository(ApiKey).findOneBy({
                apiKey: paramApiKey
            })
            if (!apiKey) {
                throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, `Unauthorized`)
            }
            return 'OK'
        } else {
            throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `UNKNOWN APIKEY_STORAGE_TYPE`)
        }
    } catch (error) {
        if (error instanceof InternalFlowiseError && error.statusCode === StatusCodes.UNAUTHORIZED) {
            throw error
        } else {
            throw new InternalFlowiseError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: apikeyService.verifyApiKey - ${getErrorMessage(error)}`
            )
        }
    }
}
const getAllApiKeysUnscoped = async (): Promise<ApiKey[]> => {
    const appServer = getRunningExpressApp()
    return await appServer.AppDataSource.getRepository(ApiKey).find()
}
export default {
    createApiKey,
    deleteApiKey,
    getAllApiKeys,
    updateApiKey,
    verifyApiKey,
    getApiKey,
    importKeys,
    getAllApiKeysUnscoped
}
