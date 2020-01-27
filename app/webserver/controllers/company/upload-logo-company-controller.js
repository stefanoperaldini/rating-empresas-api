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
  const { file } = req;

  if (parseInt(role) !== 2) {
    return res
      .status(401)
      .send("Only an user type company can update a company logo");
  }

  if (!file || !file.buffer) {
    return res.status(400).send("Invalid image");
  }

  cloudinary.uploader
    .upload_stream(
      {
        resource_type: "image",
        public_id: userId,
        width: 200,
        height: 200,
        format: "png",
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
      WHERE user_id = ?`;
          connection = await mysqlPool.getConnection();
          const [updateStatus] = await connection.execute(sqlQuery, [
            secureUrl,
            userId
          ]);
          connection.release();

          if (updateStatus.changedRows !== 1) {
            return res.status(404).send("Company not found");
          }

          res.header("Location", secureUrl);
          return res.status(201).send();
        } catch (e) {
          if (connection) {
            connection.release();
          }
          console.error(e);
          return res.status(500).send();
        }
      }
    )
    .end(file.buffer);
}

module.exports = uploadCompanyLogo;
