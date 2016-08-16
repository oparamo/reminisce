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
      memories[memory.key] = {
        val: memory.val,
        ttl: memory.ttl,
        expires: new Date().getTime() + memory.ttl
      };

      return memories;
    }, {});
  }

  get(key) {
    return B.resolve(this.memories[key]);
  }

  set(memory) {
    this.memories[memory.key] = {
      val: memory.val,
      ttl: memory.ttl,
      expires: new Date().getTime() + memory.ttl
    };

    return B.resolve(this.memories[memory.key]);
  }

  delete(key) {
    return B.resolve(delete this.memories[key]);
  }
};

module.exports = Reminisce;
