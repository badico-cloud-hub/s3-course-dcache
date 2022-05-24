import { createHash } from "crypto";
import { ICache, IRepository } from "./types"

class FakeRepository implements IRepository {
  private database: Record<string, ICache>;

  constructor() {
    // database key is {{content}}#{{metadata}}
    this.database = {}
  }

  private hashValue(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }

  private generateExpirationEpoch(expirationHours: number): number {
    // timestamp in seconds (10 digits)
    const epochInMiliseconds = Date.now() + expirationHours * 3600000
    return Number(String(epochInMiliseconds).slice(0, -3))
  }

  async get(content: string, metadata?: string) {
    const recordKey = `${content}#${this.hashValue(metadata ?? content)}`
    const record = this.database[recordKey]
    if (!record) return
    return record
  }

  async create(cacheData: ICache, expiration: number) {
    const recordKey = `${cacheData.content}#${this.hashValue(cacheData.metadata ?? cacheData.content)}`
    this.database[recordKey] = {
      ...cacheData,
      expiration: this.generateExpirationEpoch(expiration)
    }
    return cacheData
  }

  async clean() {
    this.database = {}
  }
}

export default FakeRepository



