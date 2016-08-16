'use strict';

const expect = require('chai').expect;
const Reminisce = require('../');

describe('plugin', () => {
  const memories = [
    { key: 'test1', val: 1, ttl: 10000 },
    { key: 'test2', val: 2, ttl: 20000 }
  ];
  let cache;

  beforeEach(() => {
    cache = new Reminisce({
      memories,
      options: { ttl: 60000, interval: 30000 }
    });
  });

  describe('constructor', () => {
    it('should initialize with memories', () => {
      cache = new Reminisce({ memories });

      expect(cache).to.be.an('object');
    });

    it('should initialize without memories', () => {
      cache = new Reminisce();

      expect(cache).to.be.an('object');
    });

    it('should take options', () => {
      cache = new Reminisce({
        options: { ttl: 10000, interval: 60000 }
      });

      expect(cache).to.be.an('object');
    });
  });

  describe('get memories function', () => {
    it('get a memory', () => {
      return cache.get('test1')
        .then((m) => {
          expect(m).to.have.property('val', 1);
          expect(m).to.have.property('ttl', 10000);
          expect(m).to.have.property('expires');
        });
    });

    it('return undefined if memory does not exist', () => {
      return cache.get('forgot')
        .then((m) => expect(m).to.be.undefined);
    });
  });

  describe('set memories function', () => {
    it('set a memory', () => {
      const mem = { key: 'setTest', val: 1, ttl: 10000 };

      return cache.set(mem)
        .then((m) => {
          expect(m).to.have.property('val', mem.val);
          expect(m).to.have.property('ttl', mem.ttl);
          expect(m).to.have.property('expires');
        });
    });

    it('override a memory', () => {
      const mem = { key: 'test2', val: 1, ttl: 10000 };

      return cache.set(mem)
        .then((m) => {
          expect(m).to.have.property('val', mem.val);
          expect(m).to.have.property('ttl', mem.ttl);
          expect(m).to.have.property('expires');
        });
    });
  });

  describe('delete memories function', () => {
    it('should delete a memory', () => {
      return cache.delete('test2')
        .then((result) => expect(result).to.be.true);
    });

    it('should return true even when deleting non-existing memory', () => {
      return cache.delete('forgot')
        .then((result) => expect(result).to.be.true);
    });
  });
});
