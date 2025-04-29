import { StatusCodes } from 'http-status-codes'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { Variable } from '../../database/entities/Variable'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'
import { QueryRunner } from 'typeorm'

const createVariable = async (newVariable: Variable, userId: string): Promise<Variable> => {
    try {
        const appServer = getRunningExpressApp()
        // 🧠 Attach userId before saving
        newVariable.userId = userId

        const variable = await appServer.AppDataSource.getRepository(Variable).create(newVariable)
        const dbResponse = await appServer.AppDataSource.getRepository(Variable).save(variable)
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: variablesServices.createVariable - ${getErrorMessage(error)}`
        )
    }
}

const deleteVariable = async (variableId: string, userId: string): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(Variable).delete({ id: variableId, userId })
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: variablesServices.deleteVariable - ${getErrorMessage(error)}`
        )
    }
}

const getAllVariables = async (userId: string): Promise<Variable[]> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(Variable).find({ where: { userId } })
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: variablesServices.getAllVariables - ${getErrorMessage(error)}`
        )
    }
}

const getVariableById = async (variableId: string, userId: string): Promise<Variable | null> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(Variable).findOneBy({ id: variableId, userId })
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: variablesServices.getVariableById - ${getErrorMessage(error)}`
        )
    }
}

const updateVariable = async (variable: Variable, updatedVariable: Variable): Promise<Variable> => {
    try {
        const appServer = getRunningExpressApp()

        // 🧠 Prevent userId from being overwritten
        delete (updatedVariable as any).userId

        const tmpUpdatedVariable = await appServer.AppDataSource.getRepository(Variable).merge(variable, updatedVariable)
        const dbResponse = await appServer.AppDataSource.getRepository(Variable).save(tmpUpdatedVariable)
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: variablesServices.updateVariable - ${getErrorMessage(error)}`
        )
    }
}

const importVariables = async (newVariables: Partial<Variable>[], userId: string, queryRunner?: QueryRunner): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        const repository = queryRunner ? queryRunner.manager.getRepository(Variable) : appServer.AppDataSource.getRepository(Variable)

        if (newVariables.length === 0) return

        let ids = '('
        let count = 0
        const lastCount = newVariables.length - 1
        newVariables.forEach((newVariable) => {
            ids += `'${newVariable.id}'`
            if (count !== lastCount) ids += ','
            if (count === lastCount) ids += ')'
            count++
        })

        const selectResponse = await repository
            .createQueryBuilder('v')
            .select('v.id')
            .where(`v.id IN ${ids}`)
            .andWhere('v.userId = :userId', { userId })
            .getMany()

        const foundIds = selectResponse.map((response) => response.id)

        const prepVariables = newVariables.map((newVariable) => {
            if (newVariable.id && foundIds.includes(newVariable.id)) {
                newVariable.id = undefined
                newVariable.name += ' (1)'
            }
            newVariable.userId = userId
            return newVariable
        })

        const insertResponse = await repository.insert(prepVariables)

        return insertResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: variableService.importVariables - ${getErrorMessage(error)}`
        )
    }
}

export default {
    createVariable,
    deleteVariable,
    getAllVariables,
    getVariableById,
    updateVariable,
    importVariables
}
