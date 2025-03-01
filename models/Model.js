const mysql = require('mysql2');
require('dotenv').config();

class Model {
    constructor(tableName) {
        this.tableName = tableName;
        this.db = Model.getInstance();
    }

    static getInstance() {
        if (!Model.instance) {
            const pool = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
            Model.instance = pool.promise();
        }
        return Model.instance;
    }

    async read(sql, params = []) {
        try {
            const [rows] = await this.db.query(sql, params);
            return rows;
        } catch (error) {
            throw new Error(`Read error: ${error.message}`);
        }
    }

    async create(sql, params = []) {
        try {
            const [result] = await this.db.query(sql, params);
            return result.insertId;
        } catch (error) {
            throw new Error(`Create error: ${error.message}`);
        }
    }

    async update(sql, params = []) {
        try {
            const [result] = await this.db.query(sql, params);
            return {
                status: result.affectedRows > 0,
                affectedRows: result.affectedRows
            };
        } catch (error) {
            throw new Error(`Update error: ${error.message}`);
        }
    }

    async delete(sql, params = []) {
        try {
            const [result] = await this.db.query(sql, params);
            return {
                status: result.affectedRows > 0,
                affectedRows: result.affectedRows
            };
        } catch (error) {
            throw new Error(`Delete error: ${error.message}`);
        }
    }
}

module.exports = Model;