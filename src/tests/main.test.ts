import 'dotenv/config'
import CacheTool from "../main";
import { IRepository } from "../types";
import { setupCacheTool, makeRepository, IGenerateReturnType } from "./setup";

jest.setTimeout(10000)

describe('cache tool tests', () => {
  let repository: IRepository
  let makeCacheTool: (returnType: IGenerateReturnType, cacheHoursLifetime?: number) => CacheTool

  beforeAll(async () => {
    repository = await makeRepository()
    makeCacheTool = setupCacheTool(repository)
    await repository.clean()
  })

  beforeEach(async () => {
    await repository.clean()
  })

  afterAll(async () => {
    await repository.clean()
  })

  test('it must create a new record if key was not found', async () => {
    const cacheTool = makeCacheTool('string')
    await cacheTool.getValue('image.jpg')

    const recordValue = await repository.get('image.jpg')
    expect(recordValue).toHaveProperty('value', 'a string value')
  })

  test('it must bring a record if key exist', async () => {
    const cacheTool = makeCacheTool('string')
    await repository.create({
      content: 'image123.jpg',
      value: 'foo2'
    }, 20)
    const value = await cacheTool.getValue('image123.jpg')
    expect(value).toBe('foo2')
  })

  test('it must accept objects as cache values', async () => {
    const cacheTool = makeCacheTool('object')
    await cacheTool.getValue('someKeyForObject')
    const recordValue = await repository.get('someKeyForObject')
    expect(recordValue).toHaveProperty('value', { keyOne: 'string value one', keyTwo: 'string value two' })
  })

  test('it must accept number as cache values', async () => {
    const cacheTool = makeCacheTool('number')
    await cacheTool.getValue('someKeyForNumber')
    const recordValue = await repository.get('someKeyForNumber')
    expect(recordValue).toHaveProperty('value', 1234567)
  })

  test('it must bring correct cache record when using "content" and "metadata"', async () => {
    const cacheTool = makeCacheTool('number')
    await repository.create({
      content: 'image123.jpg',
      metadata: 'user123',
      value: 'foo'
    }, 20)
    await repository.create({
      content: 'image123.jpg',
      metadata: 'userABC',
      value: 'fooABC'
    }, 20)
    const value = await cacheTool.getValue('image123.jpg', 'user123')
    expect(value).toBe('foo')
  })

  test('it must create correct timestamp for estimation atribute', async () => {
    const cacheHoursLifetime = 1
    const cacheTool = makeCacheTool('string', cacheHoursLifetime)
    await cacheTool.getValue('image1234.jpg')
    const record = await repository.get('image1234.jpg')
    const someMinutesLatter = Number(Date.now().toString().slice(0, -3)) + 3700
    const someMinutesBefore = Number(Date.now().toString().slice(0, -3)) + 3500
    expect(record?.expiration).toBeLessThan(someMinutesLatter)
    expect(record?.expiration).toBeGreaterThan(someMinutesBefore)
  })
})








