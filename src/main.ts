import 'reflect-metadata'
import { IGenerate, IRepository, ICacheToolConfig, ICacheTool } from "./types";
import CacheRepository from "./repository";

class CacheTool implements ICacheTool {
  private repository: IRepository
  private generate: IGenerate
  private expirationTime: number

  constructor(generate: IGenerate, config?: ICacheToolConfig) {
    if (config?.testRepository) {
      this.repository = config.testRepository
    } else {
      this.repository = new CacheRepository()
    }
    this.generate = generate
    this.expirationTime = config?.cacheHoursLifetime ?? 20
  }

  async getValue(content: string, metadata?: string) {
    const cacheRecord = await this.repository.get(content, metadata)
    if (!cacheRecord) {
      const newValue = await this.generate(content, metadata)
      const newRecord = {
        content,
        metadata,
        value: newValue
      }
      await this.repository.create(newRecord, this.expirationTime)
      return newValue
    }
    return cacheRecord?.value
  }
}

export default CacheTool






