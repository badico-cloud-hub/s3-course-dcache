import {
  Table,
  Entity,
  Attribute,
  AUTO_GENERATE_ATTRIBUTE_STRATEGY,
  AutoGenerateAttribute
} from '@typedorm/common';

@Entity({
  name: 'cache',
  primaryKey: {
    partitionKey: 'CONTENT#{{content}}',
    sortKey: 'METADATA#{{metadata}}',
  },
})
export class Cache {
  @Attribute()
  content!: string;

  @Attribute()
  metadata!: string;

  @Attribute()
  value!: string;

  @Attribute()
  expiration!: number;

  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.ISO_DATE,
  })
  createdAt!: string;
}

export const CacheTable = new Table({
  name: 'cache',
  partitionKey: 'PK',
  sortKey: 'SK',
});
