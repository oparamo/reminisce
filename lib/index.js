'use strict';

const B = require('bluebird');

const Reminisce = class Reminisce {
  constructor(options) {
    options = Object.assign({ memories: [], ttl: 60000 }, options);

    options.memories = Array.isArray(options.memories) ? options.memories : [ options.memories ];
    this.memories = options.memories.reduce((memories, memory) => {
      const ttl = memory.ttl || options.ttl;

      memories[memory.key] = {
        expires: new Date().getTime() + ttl,
        timeout: setTimeout(() => this.delete(memory.key), ttl),
        ttl,
        val: memory.val
      };

      return memories;
    }, {});

    delete options.memories;
    this.options = options;
  }

  get(keys) {
    keys = Array.isArray(keys) ? keys : [ keys ];

    return B.map(keys, (key) => {
      if (!this.memories[key]) {
        return B.resolve(undefined);
      }

      return B.resolve({
        expires: this.memories[key].expires,
        key,
        ttl: this.memories[key].ttl,
        val: this.memories[key].val
      });
    });
  }

  set(memories) {
    memories = Array.isArray(memories) ? memories : [ memories ];

    return B.map(memories, (memory) => {
      const key = memory.key;
      const ttl = memory.ttl || this.options.ttl;
      const expires = new Date().getTime() + ttl;

      if (this.memories[key]) {
        clearTimeout(this.memories[key].timeout);
      }

      this.memories[key] = {
        expires,
        timeout: setTimeout(() => this.delete(key), ttl),
        ttl,
        val: memory.val
      };

      return B.resolve({
        expires,
        key,
        ttl,
        val: memory.val
      });
    });
  }

  update(memories) {
    memories = Array.isArray(memories) ? memories : [ memories ];

    return B.map(memories, (memory) => {
      const key = memory.key;

      if (!this.memories[key]) {
        return B.resolve(undefined);
      }

      this.memories[key].val = memory.val;

      return B.resolve({
        expires: this.memories[key].expires,
        key: memory.key,
        ttl: this.memories[key].ttl,
        val: memory.val
      });
    });
  }

  delete(keys) {
    keys = Array.isArray(keys) ? keys : [ keys ];

    return B.map(keys, (key) => {
      if (this.memories[key]) {
        clearTimeout(this.memories[key].timeout);
      }

      return B.resolve(delete this.memories[key]);
    });
  }

  flush() {
    return this.delete(this.keys()).return(true);
  }

  keys() {
    return Object.keys(this.memories);
  }
};

module.exports = Reminisce;
