"use strict";

const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function validate(payload) {
    const schema = Joi.object({
        companyId: Joi.string()
            .guid({
                version: ["uuidv4"]
            })
            .required()
    });

    Joi.assert(payload, schema);
}

async function getCompanyCities(req, res) {
    const companyId = req.params.companyId;
    try {
        await validate({ companyId });
    } catch (e) {
        console.error(e);
        return res.status(400).send("Data are not valid");
    }

    try {
        const connection = await mysqlPool.getConnection();
        const getCompanyQuery = `SELECT c.id, c.name
                                 FROM companies_cities
                                 LEFT JOIN cities AS c
                                 ON companies_cities.city_id = c.id
                                 WHERE companies_cities.company_id = ?
                                 ORDER BY c.name`;
        const [results] = await connection.execute(getCompanyQuery, [companyId]);

        connection.release();

        if (results.length === 0) {
            return res.status(404).send("Company not found");
        }

        return res.send(results);
    } catch (e) {
        console.error(e);
        return res.status(500).send();
    }
}

module.exports = getCompanyCities;
