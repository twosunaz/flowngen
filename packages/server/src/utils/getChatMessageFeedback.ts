import { Between } from 'typeorm'
import { ChatMessageFeedback } from '../database/entities/ChatMessageFeedback'
import { getRunningExpressApp } from '../utils/getRunningExpressApp'
import { ChatFlow } from '../database/entities/ChatFlow'
import { InternalFlowiseError } from '../errors/internalFlowiseError'
import { StatusCodes } from 'http-status-codes'
/**
 * Method that get chat messages.
 * @param {string} chatflowid
 * @param {string} sortOrder
 * @param {string} chatId
 * @param {string} startDate
 * @param {string} endDate
 */
export const utilGetChatMessageFeedback = async (
    chatflowid: string,
    userId: string,
    chatId?: string,
    sortOrder: string = 'ASC',
    startDate?: string,
    endDate?: string
): Promise<ChatMessageFeedback[]> => {
    const appServer = getRunningExpressApp()
    let fromDate
    if (startDate) fromDate = new Date(startDate)

    let toDate
    if (endDate) toDate = new Date(endDate)

    // 🧠 First validate that this chatflowid belongs to the requesting user
    const chatflow = await appServer.AppDataSource.getRepository(ChatFlow).findOneBy({
        id: chatflowid,
        userId: userId
    })

    if (!chatflow) {
        throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Chatflow ${chatflowid} not found or unauthorized`)
    }

    // ✅ Then proceed to fetch feedback
    return await appServer.AppDataSource.getRepository(ChatMessageFeedback).find({
        where: {
            chatflowid,
            chatId,
            createdDate: toDate && fromDate ? Between(fromDate, toDate) : undefined
        },
        order: {
            createdDate: sortOrder === 'DESC' ? 'DESC' : 'ASC'
        }
    })
}
