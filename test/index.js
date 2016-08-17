'use strict';

const B = require('bluebird');
const expect = require('chai').expect;

const Reminisce = require('../');

describe('plugin', () => {
  let cache;
  let memories;

  beforeEach(() => {
    memories = [
      { key: 'test1', val: 1, ttl: 10000 },
      { key: 'test2', val: 2 }
    ];

    cache = new Reminisce({
      memories,
      options: { ttl: 5000, interval: 2500 }
    });
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

    it('should initialize with options', () => {
      cache = new Reminisce({
        options: { ttl: 10000, interval: 5000 }
      });

      expect(cache).to.be.an('object');
    });

    it('should initialize without memories or options', () => {
      cache = new Reminisce();

      expect(cache).to.be.an('object');
    });
  });

  describe('get memories function', () => {
    it('should get a single memory', () => {
      return cache.get('test1')
        .spread((m) => {
          expect(m).to.have.property('key', 'test1');
          expect(m).to.have.property('val', 1);
          expect(m).to.have.property('ttl', 10000);
          expect(m).to.have.property('expires');
        });
    });

    it('should get multiple memories', () => {
      return cache.get([ 'test1', 'test2' ])
        .then((m) => {
          expect(m).to.have.lengthOf(2);
          expect(m).to.have.deep.property('[0].key', 'test1');
          expect(m).to.have.deep.property('[0].val', 1);
          expect(m).to.have.deep.property('[0].ttl', 10000);
          expect(m).to.have.deep.property('[0].expires');
          expect(m).to.have.deep.property('[1].key', 'test2');
          expect(m).to.have.deep.property('[1].val', 2);
          expect(m).to.have.deep.property('[1].ttl', 5000);
          expect(m).to.have.deep.property('[1].expires');
        });
    });

    it('should return undefined if memory does not exist', () => {
      return cache.get('forgot')
        .spread((m) => expect(m).to.be.undefined);
    });
  });

  describe('set memories function', () => {
    it('should set a single memory', () => {
      const mem = { key: 'setTest', val: 1, ttl: 10000 };

      return cache.set(mem)
        .spread((m) => {
          expect(m).to.have.property('key', mem.key);
          expect(m).to.have.property('val', mem.val);
          expect(m).to.have.property('ttl', mem.ttl);
          expect(m).to.have.property('expires');
        });
    });

    it('should set multiple memories', () => {
      const setMemories = [
        { key: 'setTest1', val: 1, ttl: 10000 },
        { key: 'setTest2', val: 2 }
      ];

      return cache.set(setMemories)
        .then((m) => {
          expect(m).to.have.lengthOf(2);
          expect(m).to.have.deep.property('[0].key', 'setTest1');
          expect(m).to.have.deep.property('[0].val', 1);
          expect(m).to.have.deep.property('[0].ttl', 10000);
          expect(m).to.have.deep.property('[0].expires');
          expect(m).to.have.deep.property('[1].key', 'setTest2');
          expect(m).to.have.deep.property('[1].val', 2);
          expect(m).to.have.deep.property('[1].ttl', 5000);
          expect(m).to.have.deep.property('[1].expires');
        });
    });

    it('should override a memory', () => {
      const mem = { key: 'test2', val: 1, ttl: 10000 };

      return cache.set(mem)
        .spread((m) => {
          expect(m).to.have.property('val', mem.val);
          expect(m).to.have.property('ttl', mem.ttl);
          expect(m).to.have.property('expires');
        });
    });
  });

  describe('update memories function', () => {
    it('should update a single memory value without affecting ttl', () => {
      let ttl;
      let expires;

      const mem = { key: 'test1', val: 5 };

      return cache.update(mem)
        .spread((m) => {
          expect(m).to.have.property('key', mem.key);
          expect(m).to.have.property('val', mem.val);
          expect(m).to.have.property('ttl');
          expect(m).to.have.property('expires');

          mem.val = 6;
          ttl = m.ttl;
          expires = m.expires;

          return cache.update(mem);
        })
        .spread((m) => {
          expect(m).to.have.property('key', mem.key);
          expect(m).to.have.property('val', mem.val);
          expect(m).to.have.property('ttl', ttl);
          expect(m).to.have.property('expires', expires);
        });
    });

    it('should update multiple memories values without affecting ttl', () => {
      const ttl = [];
      const expires = [];

      const updateMemories = [
        { key: 'test1', val: 3 },
        { key: 'test2', val: 4 }
      ];

      return cache.set(updateMemories)
        .then((results) => {
          expect(results).to.have.lengthOf(2);

          results.forEach((mem, i) => {
            expect(mem).to.have.deep.property('key', updateMemories[i].key);
            expect(mem).to.have.deep.property('val', updateMemories[i].val);
            expect(mem).to.have.deep.property('ttl');
            expect(mem).to.have.deep.property('expires');

            ttl.push(mem.ttl);
            expires.push(mem.expires);
          });

          updateMemories[0].val = 5;
          updateMemories[1].val = 6;

          return cache.update(updateMemories);
        })
        .then((results) => {
          expect(results).to.have.lengthOf(2);

          results.forEach((mem, i) => {
            expect(mem).to.have.deep.property('key', updateMemories[i].key);
            expect(mem).to.have.deep.property('val', updateMemories[i].val);
            expect(mem).to.have.deep.property('ttl', ttl[i]);
            expect(mem).to.have.deep.property('expires', expires[i]);
          });
        });
    });

    it('should return undefined if memory does not exist', () => {
      const mem = { key: 'forgot', val: 1 };

      return cache.update(mem)
        .spread((m) => expect(m).to.be.undefined);
    });
  });

  describe('delete memories function', () => {
    it('should delete a single memory', () => {
      return cache.delete('test2')
        .spread((result) => expect(result).to.be.true);
    });

    it('should delete multiple memories', () => {
      return cache.delete([ 'test1', 'test2' ])
        .then((results) => {
          expect(results).to.have.lengthOf(2);

          results.forEach((result) => expect(result).to.be.true);
        });
    });

    it('should return true even when deleting non-existing memory', () => {
      return cache.delete('forgot')
        .spread((result) => expect(result).to.be.true);
    });
  });

  describe('flush function', () => {
    it('should flush all memories', () => {
      return cache.flush()
        .then((result) => expect(result).to.be.true);
    });
  });

  describe('keys function', () => {
    it('should list all memory keys', () => {
      return cache.keys()
        .then((results) => expect(results).to.have.lengthOf(2));
    });
  });

  describe('memory timeouts', () => {
    it('memories should get wiped after their ttl expires', () => {
      cache = new Reminisce({
        memories: { key: 'timeout1', val: 1 },
        options: { ttl: 50, interval: 25 }
      });

      return cache.set({ key: 'timeout2', val: 1, ttl: 50 })
        .then(() => B.delay(100))
        .then(() => cache.get('timeout2'))
        .spread((m) => expect(m).to.be.undefined)
        .then(() => cache.get('timeout1'))
        .spread((m) => expect(m).to.be.undefined);
    });
  });
});
