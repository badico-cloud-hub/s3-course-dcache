import CacheTool from "../main";
import FakeRepository from "../fake-repository";
import RealRepository from "../repository";
import { IGenerate, IRepository } from "../types";

export type IGenerateReturnType = 'string' | 'object' | 'number'

const generateByType = {
  string: async (content: string, metadata?: string) => {
    const newValue = 'a string value'
    return newValue
  },
  object: async (content: string, metadata?: string) => ({ keyOne: 'string value one', keyTwo: 'string value two' }),
  number: async (content: string, metadata?: string) => 1234567
}

const makeGenerate = (returnType: IGenerateReturnType): IGenerate => generateByType[returnType]

export const setupCacheTool = (repository: IRepository) => (returnType: IGenerateReturnType, cacheHoursLifetime: number = 0.5) => {
  const generateFunction = makeGenerate(returnType)
  const cacheTool = new CacheTool(generateFunction, { cacheHoursLifetime, testRepository: repository })
  return cacheTool
}

export const makeRepository = async (): Promise<IRepository> => {
  if (process.env.NODE_ENV === 'test:local') return new FakeRepository()
  return new RealRepository()
}
