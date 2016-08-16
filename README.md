# reminisce
Simple Node.js caching module.

get (key, cb) or ([key, key, ...], cb) -> return value, timestamp, and ttl in ms
set ({key, value, ttl}, cb) or ([{key, value, ttl}, {...}], cb) -> return value, timestamp, and ttl in ms
delete (key, cb) or ([key, key, ...], cb)
update ({key, value, ttl, upsert}, cb) or ([{key, value, ttl, upsert}, {...}], cb) -> return value, timestamp, and ttl in ms
flush (cb)
keys (cb)

key: {value: value, expires: timestamp, ttl: ttl passed in ms}

add garbage collector to keep things fresh

each set and/or update adds a new timeout function, in there check the timestamp

when creating new cache: { defaultTTL, checkperiod }
