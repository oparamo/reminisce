# reminisce
Simple Node.js caching module with promises.

## Installation
```javascript
npm i --save reminisce
```

## Example Usage
```javascript
const Reminisce = require('reminisce');
const cache = new Reminisce();

return cache.set({ key: 'example', value: 1, ttl: 10000 })
  // a 10ms delay just for example purposes
  .delay(10);
  .then(() => cache.get('example'))
  .spread((memory) => {
    // memory = { key: 'example', value: 1, expires: timestamp, lifespan: 10000, ttl: 9990 }
  });
```

## Options
An options object can be passed in when creating a new reminisce instance like so:
```javascript
const cache = new Reminisce({ memories: [], ttl: 60000 });
```
- `memories` (default: `[]`) can be a single memory object or an array of memory objects that will be stored
- `ttl` (default: `60000`) the default `ttl` for memories before they are forgotten (in milliseconds)

## Memories
When passing memory objects to the different reminisce functions, they should look like this:
```javascript
{
  key: 'example', // the String to use as a key that can be used to reference this memory later
  value: 1,       // the value being stored in memory
  ttl: 10000      // (optional) the time to live for a memory before it is forgotten (in milliseconds)
}
```
The `ttl` property is optional and will default to the `ttl` used when reminisce was initialized.

When memory objects are returned they will have `key`, `value`, and the following properties:
- `ttl` the *remaining* time to live for the memory before it is forgotten (in milliseconds)
- `expires` a UTC timestamp for when the memory is scheduled to be forgotten
- `lifespan` how long the memory was intended to live when it was created (in milliseconds)

## Get memories
```javascript
return cache.get('someKey')
  .spread((memory) => {
    // memory = { key: 'example', value: 1, expires: timestamp, lifespan: 10000, ttl: 9990 }
  });

return cache.get('forgottenKey')
  .spread((memory) => {
    // memory = undefined
  });

return cache.get([ 'someKey', 'someOtherKey', 'forgottenKey' ])
  .then((memories) => {
    // memories = [{ someMemory }, { someOtherMemory }, undefined]
  });
```
Takes a String `key` or an array of `key`'s, returns a promise that resolves to an array of memory objects. If a memory isn't associated with a given key, `undefined` will be returned in its place.

## Set memories
```javascript
return cache.set({ key: 'someKey', value: 1, ttl: 10000 })
  .spread((memory) => {
    // memory = { key: 'example', value: 1, expires: timestamp, lifespan: 10000, ttl: 10000 }
  });

const cache = new Reminisce({ ttl: 60000 });
return cache.set({ key: 'someKey', value: 1 })
  .spread((memory) => {
    // memory = { key: 'example', value: 1, expires: timestamp, lifespan: 60000, ttl: 60000 }
  });

return cache.set([{ someMemory }, { someOtherMemory }])
  .then((memories) => {
    // memories = [{ someMemory }, { someOtherMemory }]
  });
```
Takes a memory object or an array of memory objects, returns a promise that resolves to an array of memory objects. If there is already a memory associated with a given key, then this function will override that memory.

## Update memories
```javascript
const cache = new Reminisce({
  memories: { key: 'existingKey', value: 2, ttl: 30000 }
});
return cache.update({ key: 'existingKey', value: 5 })
  .spread((memory) => {
    // memory = { key: 'existingKey', value: 5, expires: timestamp, lifespan: 30000, ttl: unaffectedRemainingTTL }
  });

const cache = new Reminisce({
  memories: [{ key: 'existingKey', value: 5, ttl: 30000 }, { key: 'otherExistingKey', value: 6 }]
});
return cache.update([{ key: 'existingKey', value: 7 }, { key: 'otherExistingKey', value: 8 }])
  .then((memories) => {
  /*
    memories = [{
      key: 'existingKey',
      value: 7,
      expires: timestamp,
      lifespan: 30000,
      ttl: unaffectedRemainingTTL
    }, {
      key: 'otherExistingKey',
      value: 8,
      expires: timestamp,
      lifespan: 60000,
      ttl: unaffectedRemainingTTL
    }]
  */
  });

return cache.update({ forgottenMemory })
  .spread((memory) => {
    // memory = undefined
  });
```
Takes a memory object or an array of memory objects, returns a promise that resolves to an array of memory objects. If a memory isn't associated with a given key, `undefined` will be returned in its place. This function can be used to update memory `value`s without changing when memories are scheduled to be forgotten.


## Delete memories
```javascript
return cache.delete('someKey')
  .then((result) => {
    // result = true
  });

return cache.delete('forgottenKey')
  .then((result) => {
    // result = true
  });

return cache.delete([ 'someKey', 'someOtherKey', 'forgottenKey' ])
  .then((result) => {
    // result = true
  });
```
Takes a String `key` or an array of `key`'s, returns a promise that resolves to `true` if deletions were successful. If a memory isn't associated with a given key, a promise that resolves to `true` will still be returned.

## Flush memories
```javascript
return cache.flush()
  .then((result) => {
    // result = true
  });
```
Flushes all memories and returns a promise that resolves to `true` if successful.

## Keys
```javascript
const cache = new Reminisce({
  memories: [{ key: 'someKey', ... }, { key: 'someOtherKey', ... }]
});
console.log(cache.keys);
// -> [ 'someKey', 'someOtherKey' ]
```
Returns an array of keys associated with current memories.
