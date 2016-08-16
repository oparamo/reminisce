'use strict';

const B = require('bluebird');

const Reminisce = class Reminisce {
  constructor(setup) {
    setup = Object.assign({
      memories: [],
      options: { ttl: 60000, interval: 30000 }
    }, setup);

    this.options = setup.options;

    setup.memories = Array.isArray(setup.memories) ? setup.memories : [ setup.memories ];
    this.memories = setup.memories.reduce((memories, memory) => {
      const ttl = memory.ttl || this.options.ttl;

      memories[memory.key] = {
        val: memory.val,
        ttl,
        expires: new Date().getTime() + ttl
      };

      return memories;
    }, {});
  }

  get(keys) {
    keys = Array.isArray(keys) ? keys : [ keys ];

    return B.map(keys, (key) => {
      if (!this.memories[key]) {
        return B.resolve(undefined);
      }

      return B.resolve(Object.assign({ key }, this.memories[key]));
    });
  }

  set(memories) {
    memories = Array.isArray(memories) ? memories : [ memories ];

    return B.map(memories, (memory) => {
      const ttl = memory.ttl || this.options.ttl;

      this.memories[memory.key] = {
        val: memory.val,
        ttl,
        expires: new Date().getTime() + ttl
      };

      return B.resolve(Object.assign({ key: memory.key }, this.memories[memory.key]));
    });
  }

  delete(keys) {
    keys = Array.isArray(keys) ? keys : [ keys ];

    return B.map(keys, (key) => B.resolve(delete this.memories[key]));
  }

  flush() {
    this.memories = {};

    return B.resolve(true);
  }

  keys() {
    return B.resolve(Object.keys(this.memories));
  }
};

module.exports = Reminisce;
