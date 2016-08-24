'use strict';

const expect = require('chai').expect;
const Reminisce = require('../');

describe('plugin', () => {
  let cache;
  let memories;

  beforeEach(() => {
    memories = [{
      key: 'test1', value: 1, ttl: 10000
    }, {
      key: 'test2', value: 2
    }];

    cache = new Reminisce({ memories, ttl: 5000 });
  });

  describe('constructor', () => {
    it('should initialize with a single memory', () => {
      cache = new Reminisce({ memories: memories[0] });

      expect(cache).to.be.an('object');
    });

    it('should initialize with multiple memories', () => {
      cache = new Reminisce({ memories });

      expect(cache).to.be.an('object');
    });

    it('should initialize without options', () => {
      cache = new Reminisce();

      expect(cache).to.be.an('object');
    });
  });

  describe('get memories', () => {
    it('should get a single memory', () => {
      return cache.get(memories[0].key)
        .spread((memory) => {
          expect(memory).to.have.property('expires');
          expect(memory).to.have.property('key', memories[0].key);
          expect(memory).to.have.property('lifespan', memories[0].ttl);
          expect(memory).to.have.property('ttl');
          expect(memory).to.have.property('value', memories[0].value);
        });
    });

    it('should get multiple memories', () => {
      const keys = memories.map((memory) => memory.key);

      return cache.get(keys)
        .then((results) => {
          expect(results).to.have.lengthOf(2);

          results.forEach((memory, i) => {
            expect(memory).to.have.property('expires');
            expect(memory).to.have.property('key', memories[i].key);
            expect(memory).to.have.property('lifespan');
            expect(memory).to.have.property('ttl');
            expect(memory).to.have.property('value', memories[i].value);
          });
        });
    });

    it('should return undefined if memory does not exist', () => {
      return cache.get('forgot')
        .spread((memory) => expect(memory).to.be.undefined);
    });
  });

  describe('set memories', () => {
    it('should set a single memory', () => {
      const memory = { key: 'setTest', value: 1, ttl: 10000 };

      return cache.set(memory)
        .spread((mem) => {
          expect(mem).to.have.property('expires');
          expect(mem).to.have.property('key', memory.key);
          expect(mem).to.have.property('lifespan', memory.ttl);
          expect(mem).to.have.property('ttl');
          expect(mem).to.have.property('value', memory.value);
        });
    });

    it('should set multiple memories', () => {
      const setMemories = [
        { key: 'setTest1', value: 1, ttl: 10000 },
        { key: 'setTest2', value: 2 }
      ];

      return cache.set(setMemories)
        .then((results) => {
          expect(results).to.have.lengthOf(2);

          results.forEach((memory, i) => {
            expect(memory).to.have.property('expires');
            expect(memory).to.have.property('key', setMemories[i].key);
            expect(memory).to.have.property('lifespan');
            expect(memory).to.have.property('ttl');
            expect(memory).to.have.property('value', setMemories[i].value);
          });
        });
    });

    it('should override a memory', () => {
      const memory = { key: 'test2', value: 1, ttl: 10000 };

      return cache.set(memory)
        .spread((mem) => {
          expect(mem).to.have.property('expires');
          expect(mem).to.have.property('key', memory.key);
          expect(mem).to.have.property('lifespan', memory.ttl);
          expect(mem).to.have.property('ttl');
          expect(mem).to.have.property('value', memory.value);
        });
    });
  });

  describe('update memories', () => {
    it('should update a single memory valueue without affecting expires', () => {
      let expires;

      memories[0].value = 3;

      return cache.update(memories[0])
        .spread((memory) => {
          expect(memory).to.have.property('expires');
          expect(memory).to.have.property('key', memories[0].key);
          expect(memory).to.have.property('lifespan', memories[0].ttl);
          expect(memory).to.have.property('ttl');
          expect(memory).to.have.property('value', memories[0].value);

          memories[0].value = 4;
          expires = memory.expires;

          return cache.update(memories[0]);
        })
        .spread((memory) => {
          expect(memory).to.have.property('expires', expires);
          expect(memory).to.have.property('key', memories[0].key);
          expect(memory).to.have.property('lifespan', memories[0].ttl);
          expect(memory).to.have.property('ttl');
          expect(memory).to.have.property('value', memories[0].value);
        });
    });

    it('should update multiple memories valueues without affecting expires', () => {
      const expires = [];

      const updateMemories = [
        { key: 'test1', value: 3 },
        { key: 'test2', value: 4 }
      ];

      return cache.update(updateMemories)
        .then((results) => {
          expect(results).to.have.lengthOf(2);

          results.forEach((memory, i) => {
            expect(memory).to.have.property('expires');
            expect(memory).to.have.property('key', updateMemories[i].key);
            expect(memory).to.have.property('lifespan');
            expect(memory).to.have.property('ttl');
            expect(memory).to.have.property('value', updateMemories[i].value);

            expires.push(memory.expires);
          });

          updateMemories[0].value = 5;
          updateMemories[1].value = 6;

          return cache.update(updateMemories);
        })
        .then((results) => {
          expect(results).to.have.lengthOf(2);

          results.forEach((memory, i) => {
            expect(memory).to.have.property('expires', expires[i]);
            expect(memory).to.have.property('key', updateMemories[i].key);
            expect(memory).to.have.property('lifespan');
            expect(memory).to.have.property('ttl');
            expect(memory).to.have.property('value', updateMemories[i].value);
          });
        });
    });

    it('should return undefined if memory does not exist', () => {
      const memory = { key: 'forgot', value: 1 };

      return cache.update(memory)
        .spread((mem) => expect(mem).to.be.undefined);
    });
  });

  describe('delete memories', () => {
    it('should delete a single memory', () => {
      return cache.delete(memories[0].key)
        .then((result) => expect(result).to.be.true);
    });

    it('should delete multiple memories', () => {
      const keys = memories.map((memory) => memory.key);

      return cache.delete(keys)
        .then((result) => expect(result).to.be.true);
    });

    it('should return true even when deleting non-existing memory', () => {
      return cache.delete('forgot')
        .then((result) => expect(result).to.be.true);
    });
  });

  describe('flush memories', () => {
    it('should flush all memories', () => {
      return cache.flush()
        .then((result) => expect(result).to.be.true);
    });
  });

  describe('get keys', () => {
    it('should list all memory keys', () => {
      expect(cache.keys()).to.have.lengthOf(memories.length);
    });
  });

  describe('timing', () => {
    it('should wipe memories after their ttl is up', () => {
      cache = new Reminisce({
        memories: { key: 'timeout1', value: 1 },
        ttl: 10
      });

      return cache.set({ key: 'timeout2', value: 1, ttl: 10 })
        .delay(20)
        .then(() => cache.get([ 'timeout1', 'timeout2' ]))
        .then((results) => {
          expect(results).to.be.lengthOf(2);

          results.forEach((result) => expect(result).to.be.undefined);
        });
    });

    it('should report a smaller ttl when a memory is returned', () => {
      let ttl;

      return cache.get(memories[0].key)
        .spread((memory) => {
          ttl = memory.ttl;
        })
        .delay(5)
        .then(() => cache.get(memories[0].key))
        .spread((memory) => expect(memory.ttl).to.be.below(ttl));
    });
  });
});
