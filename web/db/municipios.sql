-- ======================================================
-- MUNICIPIOS DE COLOMBIA (CAPITALES + SANTANDER PRINCIPALES)
-- ======================================================

-- Vaciar tablas
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE TMunicipio;
TRUNCATE TABLE TDepartamento;
SET FOREIGN_KEY_CHECKS = 1;

-- Crear tablas si no existen
CREATE TABLE IF NOT EXISTS TDepartamento (
  nDepartamentoID INT PRIMARY KEY AUTO_INCREMENT,
  cNombre VARCHAR(255) UNIQUE,
  cCodigoDane VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS TMunicipio (
  nMunicipioID INT PRIMARY KEY AUTO_INCREMENT,
  nDepartamentoFK INT,
  cNombre VARCHAR(255),
  cCodigoDane VARCHAR(255) UNIQUE,
  FOREIGN KEY (nDepartamentoFK) REFERENCES TDepartamento(nDepartamentoID)
) ENGINE=InnoDB;

-- Insertar departamentos (solo si no existen)
INSERT IGNORE INTO TDepartamento (cNombre, cCodigoDane) VALUES
('Amazonas', '91'),
('Antioquia', '05'),
('Arauca', '81'),
('Atlántico', '08'),
('Bolívar', '13'),
('Boyacá', '15'),
('Caldas', '17'),
('Caquetá', '18'),
('Casanare', '85'),
('Cauca', '19'),
('Cesar', '20'),
('Chocó', '27'),
('Córdoba', '23'),
('Cundinamarca', '25'),
('Guainía', '94'),
('Guaviare', '95'),
('Huila', '41'),
('La Guajira', '44'),
('Magdalena', '47'),
('Meta', '50'),
('Nariño', '52'),
('Norte de Santander', '54'),
('Putumayo', '86'),
('Quindío', '63'),
('Risaralda', '66'),
('San Andrés y Providencia', '88'),
('Santander', '68'),
('Sucre', '70'),
('Tolima', '73'),
('Valle del Cauca', '76'),
('Vaupés', '97'),
('Vichada', '99');

-- Capitales principales
INSERT IGNORE INTO TMunicipio (nDepartamentoFK, cNombre, cCodigoDane)
VALUES ((SELECT nDepartamentoID FROM TDepartamento WHERE cNombre='Cundinamarca'), 'Bogotá D.C.', '11001');

INSERT IGNORE INTO TMunicipio (nDepartamentoFK, cNombre, cCodigoDane)
VALUES ((SELECT nDepartamentoID FROM TDepartamento WHERE cNombre='Antioquia'), 'Medellín', '05001');

INSERT IGNORE INTO TMunicipio (nDepartamentoFK, cNombre, cCodigoDane)
VALUES ((SELECT nDepartamentoID FROM TDepartamento WHERE cNombre='Santander'), 'Bucaramanga', '68001');

-- Santander: ciudades principales
INSERT IGNORE INTO TMunicipio (nDepartamentoFK, cNombre, cCodigoDane)
VALUES ((SELECT nDepartamentoID FROM TDepartamento WHERE cNombre='Santander'), 'Barrancabermeja', '68081');

INSERT IGNORE INTO TMunicipio (nDepartamentoFK, cNombre, cCodigoDane)
VALUES ((SELECT nDepartamentoID FROM TDepartamento WHERE cNombre='Santander'), 'Floridablanca', '68176');

INSERT IGNORE INTO TMunicipio (nDepartamentoFK, cNombre, cCodigoDane)
VALUES ((SELECT nDepartamentoID FROM TDepartamento WHERE cNombre='Santander'), 'Girón', '68276');

INSERT IGNORE INTO TMunicipio (nDepartamentoFK, cNombre, cCodigoDane)
VALUES ((SELECT nDepartamentoID FROM TDepartamento WHERE cNombre='Santander'), 'Piedecuesta', '68547');
