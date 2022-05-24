export type ICache = {
  content: string
  value: CacheValue
  metadata?: string
  expiration?: number
}

export interface IRepository {
  get: (content: string, metadata?: string) => Promise<ICache | undefined>
  create: (cacheParams: ICache, expirationHours: number) => Promise<ICache>
  clean: () => Promise<void>
}

export type CacheValue = string | number | object

export type IGenerate = (content: string, metadata?: string) => Promise<CacheValue>

export interface ICacheToolConfig {
  cacheHoursLifetime: number
  testRepository?: IRepository
}

export interface ICacheTool {
  getValue: (content: string, metadata?: string) => Promise<CacheValue>
}

