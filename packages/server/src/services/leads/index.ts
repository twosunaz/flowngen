import { v4 as uuidv4 } from 'uuid'
import { StatusCodes } from 'http-status-codes'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { Lead } from '../../database/entities/Lead'
import { ILead } from '../../Interface'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'

const getAllLeads = async (chatflowid: string, userId: string) => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(Lead).find({
            where: {
                chatflowid,
                userId // 🧠 scope to ONLY leads belonging to the logged-in user
            }
        })
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: leadsService.getAllLeads - ${getErrorMessage(error)}`)
    }
}

const createLead = async (body: Partial<ILead>, userId: string) => {
    try {
        const chatId = body.chatId ?? uuidv4()

        const newLead = new Lead()
        Object.assign(newLead, body)
        Object.assign(newLead, { chatId })
        newLead.userId = userId // 🧠 Attach userId to the new lead

        const appServer = getRunningExpressApp()
        const lead = appServer.AppDataSource.getRepository(Lead).create(newLead)
        const dbResponse = await appServer.AppDataSource.getRepository(Lead).save(lead)
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: leadsService.createLead - ${getErrorMessage(error)}`)
    }
}

export default {
    createLead,
    getAllLeads
}
