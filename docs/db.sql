DROP DATABASE RatingEmpresas;

CREATE DATABASE IF NOT EXISTS RatingEmpresas CHARACTER SET utf8;

USE RatingEmpresas;

CREATE TABLE IF NOT EXISTS Ccaas (
	id CHAR(2) PRIMARY KEY COLLATE utf8_unicode_ci NOT NULL,
    name VARCHAR(30) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS Provincias (
	
    id CHAR(2) PRIMARY KEY COLLATE utf8_unicode_ci NOT NULL,
    name VARCHAR(30) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS Municipios (
	id CHAR(3) COLLATE utf8_unicode_ci NOT NULL,
    name VARCHAR(60) COLLATE utf8_unicode_ci NOT NULL,
    ccaa_id CHAR(2) COLLATE utf8_unicode_ci NOT NULL,
    provincia_id CHAR (2) COLLATE utf8_unicode_ci NOT NULL,
    dc_id CHAR(1) COLLATE utf8_unicode_ci NOT NULL,
    CONSTRAINT municipios_fk_ccaa_id_ccaas_id FOREIGN KEY (ccaa_id) REFERENCES Ccaas(id),
    CONSTRAINT municipios_fk_provincia_id_provincias_id FOREIGN KEY (provincia_id) REFERENCES Provincias(id),
	PRIMARY KEY (id, ccaa_id, provincia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ciCOLLATE utf8_unicode_ci NOT NULL,;

CREATE TABLE users (
  id char(36) COLLATE utf8_unicode_ci NOT NULL,
  email varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  password char(255) COLLATE utf8_unicode_ci NOT NULL,
  avatar_url varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  created_at datetime DEFAULT NULL,
  modified_at datetime DEFAULT NULL,
  deleted_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
