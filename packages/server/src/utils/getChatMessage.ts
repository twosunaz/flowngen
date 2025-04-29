import { MoreThanOrEqual, LessThanOrEqual, Between, In } from 'typeorm'
import { ChatMessageRatingType, ChatType } from '../Interface'
import { ChatMessage } from '../database/entities/ChatMessage'
import { ChatMessageFeedback } from '../database/entities/ChatMessageFeedback'
import { getRunningExpressApp } from '../utils/getRunningExpressApp'
import { aMonthAgo } from '.'

/**
 * Method that get chat messages.
 * @param {string} chatflowid
 * @param {ChatType[]} chatTypes
 * @param {string} sortOrder
 * @param {string} chatId
 * @param {string} memoryType
 * @param {string} sessionId
 * @param {string} startDate
 * @param {string} endDate
 * @param {boolean} feedback
 * @param {ChatMessageRatingType[]} feedbackTypes
 */
interface GetChatMessageParams {
    chatflowid: string
    chatTypes?: ChatType[]
    sortOrder?: string
    chatId?: string
    memoryType?: string
    sessionId?: string
    startDate?: string
    endDate?: string
    messageId?: string
    feedback?: boolean
    feedbackTypes?: ChatMessageRatingType[]
}

export const utilGetChatMessage = async ({
    chatflowid,
    chatTypes,
    sortOrder = 'ASC',
    chatId,
    memoryType,
    sessionId,
    startDate,
    endDate,
    messageId,
    feedback,
    feedbackTypes,
    userId // 🧠 Add userId
}: GetChatMessageParams & { userId?: string }): Promise<ChatMessage[]> => {
    const appServer = getRunningExpressApp()

    if (feedback) {
        const query = await appServer.AppDataSource.getRepository(ChatMessage).createQueryBuilder('chat_message')

        query
            .leftJoinAndMapOne('chat_message.feedback', ChatMessageFeedback, 'feedback', 'feedback.messageId = chat_message.id')
            .where('chat_message.chatflowid = :chatflowid', { chatflowid })

        // 🧠 Enforce userId filter if available
        if (userId) {
            query.andWhere('chat_message.userId = :userId', { userId })
        }

        if (chatTypes && chatTypes.length > 0) {
            query.andWhere('chat_message.chatType IN (:...chatTypes)', { chatTypes })
        }
        if (chatId) {
            query.andWhere('chat_message.chatId = :chatId', { chatId })
        }
        if (memoryType) {
            query.andWhere('chat_message.memoryType = :memoryType', { memoryType })
        }
        if (sessionId) {
            query.andWhere('chat_message.sessionId = :sessionId', { sessionId })
        }

        if (startDate) {
            query.andWhere('chat_message.createdDate >= :startDateTime', { startDateTime: startDate ? new Date(startDate) : aMonthAgo() })
        }
        if (endDate) {
            query.andWhere('chat_message.createdDate <= :endDateTime', { endDateTime: endDate ? new Date(endDate) : new Date() })
        }

        query.orderBy('chat_message.createdDate', sortOrder === 'DESC' ? 'DESC' : 'ASC')

        const messages = (await query.getMany()) as Array<ChatMessage & { feedback: ChatMessageFeedback }>

        if (feedbackTypes && feedbackTypes.length > 0) {
            const indicesToKeep = new Set()

            messages.forEach((message, index) => {
                if (message.role === 'apiMessage' && message.feedback && feedbackTypes.includes(message.feedback.rating)) {
                    if (index > 0) indicesToKeep.add(index - 1)
                    indicesToKeep.add(index)
                }
            })

            return messages.filter((_, index) => indicesToKeep.has(index))
        }

        return messages
    }

    let createdDateQuery
    if (startDate || endDate) {
        if (startDate && endDate) {
            createdDateQuery = Between(new Date(startDate), new Date(endDate))
        } else if (startDate) {
            createdDateQuery = MoreThanOrEqual(new Date(startDate))
        } else if (endDate) {
            createdDateQuery = LessThanOrEqual(new Date(endDate))
        }
    }

    // 🧠 Enforce userId filter here too
    return await appServer.AppDataSource.getRepository(ChatMessage).find({
        where: {
            chatflowid,
            chatType: chatTypes?.length ? In(chatTypes) : undefined,
            chatId,
            memoryType: memoryType ?? undefined,
            sessionId: sessionId ?? undefined,
            createdDate: createdDateQuery,
            id: messageId ?? undefined,
            userId: userId ?? undefined // 🧠 Added userId check
        },
        order: {
            createdDate: sortOrder === 'DESC' ? 'DESC' : 'ASC'
        }
    })
}
