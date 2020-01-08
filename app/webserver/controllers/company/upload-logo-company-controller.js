"use strict";

const cloudinary = require("cloudinary").v2;
const mysqlPool = require("../../../database/mysql-pool");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadCompanyLogo(req, res) {
  const { userId, role } = req.claims;
  const { companyId, file } = req;

  if (!file || !file.buffer) {
    return res.status(400).send({
      message: "invalid image"
    });
  }

  cloudinary.uploader
    .upload_stream(
      {
        resource_type: "image",
        public_id: userId,
        width: 200,
        height: 200,
        format: "jpg",
        crop: "limit"
      },
      async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(400).send(err);
        }

        const { secure_url: secureUrl } = result;

        let connection;
        try {
          const sqlQuery = `UPDATE companies
      SET url_logo = ?
      WHERE id = ?`;
          connection = await mysqlPool.getConnection();
          connection.execute(sqlQuery, [secureUrl, companyId]);
          connection.release();

          console.log(result.secure_url);
          res.header("Location", secureUrl);
          return res.status(201).send();
        } catch (e) {
          if (connection) {
            connection.release();
          }
          console.error(e);
          return res.status(500).send(e.message);
        }
      }
    )
    .end(file.buffer);
}

module.exports = uploadCompanyLogo;
