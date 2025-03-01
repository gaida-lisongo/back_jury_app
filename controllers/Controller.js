const cache = require('../utils/cache');

class Controller {
    constructor() {
        this.cacheName = this.constructor.name.replace('Controller', '').toLowerCase();
        this.statusCodes = {
            OK: 200,
            CREATED: 201,
            NO_CONTENT: 204,
            BAD_REQUEST: 400,
            UNAUTHORIZED: 401,
            FORBIDDEN: 403,
            NOT_FOUND: 404,
            CONFLICT: 409,
            INTERNAL_SERVER: 500
        };
    }

    generateCacheKey(action, params = '') {
        return `${this.cacheName}_${action}_${params}`;
    }

    async getFromCache(action, params = '') {
        const key = this.generateCacheKey(action, params);
        return await cache.get(key);
    }

    async setToCache(action, data, lifetime = 300, params = '') {
        const key = this.generateCacheKey(action, params);
        console.log("key cache", key);
        return await cache.set(key, data, lifetime);
    }

    async deleteFromCache(action, params = '') {
        const key = this.generateCacheKey(action, params);
        return await cache.delete(key);
    }

    async withCache(res, action, callback, params = '', lifetime = 300) {
        try {
            let data = await this.getFromCache(action, params);
            
            if (!data) {
                data = await callback();
                await this.setToCache(action, data, lifetime, params);
            }
            
            return this.success(res, data);
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    success(res, data = null, message = 'Success', status = this.statusCodes.OK) {
        return res.status(status).json({
            success: true,
            message,
            data
        });
    }

    created(res, data = null, message = 'Resource created successfully') {
        return this.success(res, data, message, this.statusCodes.CREATED);
    }

    error(res, message = 'An error occurred', status = this.statusCodes.INTERNAL_SERVER, errors = null) {
        return res.status(status).json({
            success: false,
            message,
            errors
        });
    }

    notFound(res, message = 'Resource not found') {
        return this.error(res, message, this.statusCodes.NOT_FOUND);
    }

    badRequest(res, message = 'Bad request', errors = null) {
        return this.error(res, message, this.statusCodes.BAD_REQUEST, errors);
    }

    unauthorized(res, message = 'Unauthorized') {
        return this.error(res, message, this.statusCodes.UNAUTHORIZED);
    }

    forbidden(res, message = 'Forbidden') {
        return this.error(res, message, this.statusCodes.FORBIDDEN);
    }

    conflict(res, message = 'Conflict') {
        return this.error(res, message, this.statusCodes.CONFLICT);
    }
}

module.exports = Controller;