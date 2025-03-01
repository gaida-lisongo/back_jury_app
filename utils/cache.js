const Memcached = require('memcached');

class Cache {
    constructor() {
        if (!Cache.instance) {
            const servers = `${process.env.MEMCACHED_HOST || 'localhost'}:${process.env.MEMCACHED_PORT || 11211}`;
            this.memcached = new Memcached(servers, {
                retries: 10,
                retry: 10000,
                remove: true,
                failOverServers: null
            });
            Cache.instance = this;
        }
        return Cache.instance;
    }

    async get(key) {
        return new Promise((resolve, reject) => {
            this.memcached.get(key, (err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });
    }

    async set(key, value, lifetime = 3600) {
        return new Promise((resolve, reject) => {
            this.memcached.set(key, value, lifetime, (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }

    async delete(key) {
        return new Promise((resolve, reject) => {
            this.memcached.del(key, (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }
}

module.exports = new Cache();