LOAD DATA LOCAL INFILE '/home/hab45/bootcamp/Proyectos/rating empresas/rating-empresas-api/docs/19_cod_ccaa.csv'
INTO TABLE regions  
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id, name);

LOAD DATA LOCAL INFILE '/home/hab45/bootcamp/Proyectos/rating empresas/rating-empresas-api/docs/19_cod_prov.csv'
INTO TABLE provinces  
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id, name);

LOAD DATA LOCAL INFILE '/home/hab45/bootcamp/Proyectos/rating empresas/rating-empresas-api/docs/19_codmun.csv'
INTO TABLE cities  
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id, region_id, province_id, name);