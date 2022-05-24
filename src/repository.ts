import AWS from 'aws-sdk';
import { createConnection, EntityManager, getEntityManager, getScanManager } from "@typedorm/core";
import { createHash } from 'crypto'
import { IRepository, ICache } from "./types";
import { Cache, CacheTable } from "./entity";
import { ScanManager } from '@typedorm/core/src/classes/manager/scan-manager';

class CacheRepository implements IRepository {
  private dbEntity: EntityManager
  private dbScan: ScanManager

  constructor() {
    const docClient = new AWS.DynamoDB.DocumentClient({
      region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
      correctClockSkew: true,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    })

    createConnection({
      table: CacheTable,
      entities: [Cache],
      documentClient: docClient,
    });

    this.dbEntity = getEntityManager()
    this.dbScan = getScanManager()
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
    const metadataQuery = metadata ? { keyCondition: { BEGINS_WITH: `METADATA#${this.hashValue(metadata)}` } } : {}
    const result = await this.dbEntity.find(Cache, { content }, metadataQuery)
    return !!result.items.length ? result.items[0] : undefined
  }

  async create(cacheData: ICache, expiration: number) {
    const newCacheRecord = new Cache()
    Object.assign(newCacheRecord, {
      ...cacheData,
      metadata: this.hashValue(cacheData.metadata ?? cacheData.content),
      expiration: this.generateExpirationEpoch(expiration)
    })
    const newlyCreatedCache = await this.dbEntity.create<Cache>(newCacheRecord)
    return newlyCreatedCache
  }

  async clean() {
    const scanResult = await this.dbScan.scan<Cache>()
    if (!scanResult.items) return
    await Promise.all(scanResult.items.map(
      async (item) => this.dbEntity.delete(Cache, { content: item.content, metadata: item.metadata }))
    )
  }
}

export default CacheRepository






