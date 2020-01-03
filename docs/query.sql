DROP SCHEMA EnterpriseRanking;

USE EnterpriseRanking;

SELECT * FROM regions ORDER BY name;
SELECT * FROM provinces ORDER BY name;
SELECT * FROM cities ORDER BY name;

SELECT * FROM cities WHERE name="Coruña, A"
