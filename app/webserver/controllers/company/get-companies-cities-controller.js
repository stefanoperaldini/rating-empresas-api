"use strict";

const mysqlPool = require("../../../database/mysql-pool");

async function getCompaniesCities(req, res, next) {

    try {
        const connection = await mysqlPool.getConnection();
        const getCompanyQuery = `SELECT DISTINCT c.id, c.name
                                 FROM companies_cities
                                 LEFT JOIN cities AS c
                                 ON companies_cities.city_id = c.id
                                 ORDER BY c.name`;
        const [results] = await connection.execute(getCompanyQuery);
        connection.release();
        if (results.length === 0) {
            return res.status(404).send("Cities not founded");
        }

        return res.send(results);

    } catch (e) {
        console.error(e);
        return res.status(500).send();
    }
}

module.exports = getCompaniesCities;
