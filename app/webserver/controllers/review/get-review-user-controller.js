"use strict";

const mysqlPool = require("../../../database/mysql-pool");

async function getReviewUser(req, res) {
  const { userId } = req.claims;
  let connection;
  try {
    connection = await mysqlPool.getConnection();
    const sqlQuery = `SELECT r.id, r.start_year, r.end_year, r.created_at, 
                        r.salary_valuation, r.inhouse_training, r.growth_opportunities, 
                        r.work_enviroment, r.personal_life, r.comment_title, r.comment, 
                        p.name, c.name as company_name, ci.name as city_name,
                        (r.salary_valuation + r.inhouse_training + r.growth_opportunities + r.work_enviroment +  r.personal_life )/5.0 as everage
                      FROM reviews r
                      LEFT JOIN positions p
                        ON r.position_id = p.id
                        LEFT JOIN companies c
                        ON r.company_id = c.id
                        LEFT JOIN cities ci
                        ON r.city_id = ci.id
                      WHERE
                        r.user_id = ?
                        AND r.deleted_at IS NULL
                      GROUP BY r.id
                      ORDER BY r.created_at DESC;`;

    const [rows] = await connection.execute(sqlQuery, [userId]);
    connection.release();

    if (rows.length === 0) {
      return res.status(404).send("Review(s) not found");
    }

    const reviews = rows.map(review => {
      const created_at = review.created_at.toISOString().substring(0, 10);

      return {
        ...review,
        created_at,
      };
    });

    return res.send(reviews);
  } catch (e) {
    if (connection) {
      connection.release();
    }
    console.error(e);
    return res.status(500).send();
  }
}

module.exports = getReviewUser;
