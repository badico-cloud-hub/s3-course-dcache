# DCache 

It expects the following envs:

```js
AWS_DEFAULT_REGION (defaults to 'us-east-1')
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

### Install
```js
npm i dcache_content
```

### How to use

````js
// import the class
import { CacheTool } from 'dcache_content'

// create the instance and pass the generate function that will create the cache record
const cacheTool = new CacheTool(generateFunction, config)

// just async 'getValue' and let we do the hard work
const value = await cacheTool.getValue(content, metadata)

```
