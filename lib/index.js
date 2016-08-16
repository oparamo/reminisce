'use strict';

const Reminisce = class Reminisce {
  constructor(memories, options) {
    this.memories = memories ? memories : {};
    this.options = Object.assign({ ttl: 60000, tidyInterval: 60000 }, options);

    Object.keys(this.memories).forEach((key) => {
      this.memories[key].expires = new Date().getTime() + this.memories[key].ttl;
    });
  }

  get(key) {
    return Promise.resolve(this.memories[key]);
  }

  set(memory) {
    this.memories[memory.key] = {
      val: memory.val,
      ttl: memory.ttl,
      expires: new Date().getTime() + memory.ttl
    };

    return Promise.resolve(this.memories[memory.key]);
  }

  delete(key) {
    return Promise.resolve(delete this.memories[key]);
  }
};

module.exports = Reminisce;
