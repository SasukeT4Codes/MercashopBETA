-- ======================================================
-- 1. CONFIGURACIÓN INICIAL
-- ======================================================
SET FOREIGN_KEY_CHECKS = 0;

-- ======================================================
-- 2. TABLAS INDEPENDIENTES Y COMPARTIDAS
-- ======================================================

CREATE TABLE TDepartamento (
  nDepartamentoID INT PRIMARY KEY AUTO_INCREMENT,
  cNombre VARCHAR(255),
  cCodigoDane VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE TMunicipio (
  nMunicipioID INT PRIMARY KEY AUTO_INCREMENT,
  nDepartamentoFK INT,
  cNombre VARCHAR(255),
  cCodigoDane VARCHAR(255),
  FOREIGN KEY (nDepartamentoFK) REFERENCES TDepartamento(nDepartamentoID)
) ENGINE=InnoDB;

CREATE TABLE TDireccion (
  nDireccionID INT PRIMARY KEY AUTO_INCREMENT,
  cNomenclatura VARCHAR(255),
  cBarrio VARCHAR(255),
  cNotasAdicionales VARCHAR(255),
  cCodigoPostal VARCHAR(255),
  nMunicipioFK INT,
  FOREIGN KEY (nMunicipioFK) REFERENCES TMunicipio(nMunicipioID)
) ENGINE=InnoDB;

CREATE TABLE TEstadoPedido (
  nEstadoPedidoID INT PRIMARY KEY AUTO_INCREMENT,
  cNombreEstado VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE TRoles (
  nRolID INT PRIMARY KEY AUTO_INCREMENT,
  cNombre VARCHAR(255),
  cDescripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE TCategoria (
  nCategoriaID INT PRIMARY KEY AUTO_INCREMENT,
  cNombreCategoria VARCHAR(255),
  nCategoriaPadreFK INT,
  bEstado BOOLEAN,
  FOREIGN KEY (nCategoriaPadreFK) REFERENCES TCategoria(nCategoriaID)
) ENGINE=InnoDB;

-- ======================================================
-- 3. MÓDULO CLIENTE
-- ======================================================

CREATE TABLE TUsuarioCliente (
  nUsuarioClienteID INT PRIMARY KEY AUTO_INCREMENT,
  cNombre VARCHAR(255),
  cApellido VARCHAR(255),
  cDocumento VARCHAR(255),
  cContrasena VARCHAR(255),
  cCorreo VARCHAR(255),
  cTelefono VARCHAR(255),
  nDireccionFK INT,
  FOREIGN KEY (nDireccionFK) REFERENCES TDireccion(nDireccionID)
) ENGINE=InnoDB;

CREATE TABLE TDireccionCliente (
  nDireccionClienteID INT PRIMARY KEY AUTO_INCREMENT,
  nClienteFK INT,
  nDireccionFK INT,
  cEtiqueta VARCHAR(255),
  cNombreRecibidor VARCHAR(255),
  cTelefonoRecibidor VARCHAR(255),
  FOREIGN KEY (nClienteFK) REFERENCES TUsuarioCliente(nUsuarioClienteID),
  FOREIGN KEY (nDireccionFK) REFERENCES TDireccion(nDireccionID)
) ENGINE=InnoDB;

CREATE TABLE TCarrito (
  nCarritoID INT PRIMARY KEY AUTO_INCREMENT,
  nUsuarioClienteFK INT,
  eEstado VARCHAR(255),
  dFechaUltActualizacion TIMESTAMP,
  dFechaExpiracion TIMESTAMP,
  FOREIGN KEY (nUsuarioClienteFK) REFERENCES TUsuarioCliente(nUsuarioClienteID)
) ENGINE=InnoDB;

-- ======================================================
-- 4. MÓDULO TIENDA
-- ======================================================

CREATE TABLE TTiendas (
  nTiendaID INT PRIMARY KEY AUTO_INCREMENT,
  cNombreComercial VARCHAR(255),
  tDescripcion TEXT,
  cUrlLogo VARCHAR(255),
  cCorreoAtencion VARCHAR(255),
  cTelefonoAtencion VARCHAR(255),
  cRazonSocial VARCHAR(255),
  nDireccionFK INT,
  cCodigoPostal VARCHAR(255),
  eEstadoTienda ENUM('Activa', 'Inactiva', 'Suspendida', 'Pendiente'),
  nPlanFK INT,
  dFechaVencimientoSuscripcion TIMESTAMP,
  FOREIGN KEY (nDireccionFK) REFERENCES TDireccion(nDireccionID)
) ENGINE=InnoDB;

CREATE TABLE TProductos (
  nProductoID INT PRIMARY KEY AUTO_INCREMENT,
  nTiendaFK INT,
  cDescripcionCorta VARCHAR(255),
  cDescripcionLarga TEXT,
  cUrlImagenPrincipal VARCHAR(255),
  nCategoriaFK INT,
  jEspecificaciones JSON,
  nPrecioUnitario DECIMAL(19,4),
  nCantidadStock INT,
  FOREIGN KEY (nTiendaFK) REFERENCES TTiendas(nTiendaID),
  FOREIGN KEY (nCategoriaFK) REFERENCES TCategoria(nCategoriaID)
) ENGINE=InnoDB;

CREATE TABLE TTrabajador (
  nTrabajadorID INT PRIMARY KEY AUTO_INCREMENT,
  cIdentificacion VARCHAR(255),
  cNombre VARCHAR(255),
  cApellido VARCHAR(255),
  cPassword VARCHAR(255),
  cTelefono VARCHAR(255),
  nRolFK INT,
  FOREIGN KEY (nRolFK) REFERENCES TRoles(nRolID)
) ENGINE=InnoDB;

CREATE TABLE TTrabajadorTienda (
  nID INT PRIMARY KEY AUTO_INCREMENT,
  nTiendaFK INT,
  nTrabajadorFK INT,
  FOREIGN KEY (nTiendaFK) REFERENCES TTiendas(nTiendaID),
  FOREIGN KEY (nTrabajadorFK) REFERENCES TTrabajador(nTrabajadorID)
) ENGINE=InnoDB;

-- ======================================================
-- 5. PEDIDOS Y TRANSACCIONES
-- ======================================================

CREATE TABLE TPedido (
  nPedidoID INT PRIMARY KEY AUTO_INCREMENT,
  nClienteFK INT,
  nDireccionClienteFK INT,
  cNumeroComprobante VARCHAR(255),
  nSubtotal DECIMAL(19,4),
  nCostoEnvio DECIMAL(19,4),
  nTotal DECIMAL(19,4),
  nTransaccionPasarelaFK INT,
  nEstadoPedidoFK INT,
  dFechaActualizacion TIMESTAMP,
  FOREIGN KEY (nClienteFK) REFERENCES TUsuarioCliente(nUsuarioClienteID),
  FOREIGN KEY (nDireccionClienteFK) REFERENCES TDireccionCliente(nDireccionClienteID),
  FOREIGN KEY (nEstadoPedidoFK) REFERENCES TEstadoPedido(nEstadoPedidoID)
) ENGINE=InnoDB;

CREATE TABLE TDetallePedido (
  nDetallePedidoID INT PRIMARY KEY AUTO_INCREMENT,
  nPedidoFK INT,
  nProductoFK INT,
  cNombreProducto VARCHAR(255),
  nPrecioCompra DECIMAL(19,4),
  nCantidad INT,
  nSubtotal DECIMAL(19,4),
  FOREIGN KEY (nPedidoFK) REFERENCES TPedido(nPedidoID),
  FOREIGN KEY (nProductoFK) REFERENCES TProductos(nProductoID)
) ENGINE=InnoDB;

CREATE TABLE TTransaccionPasarela (
  nTransaccionID INT PRIMARY KEY AUTO_INCREMENT,
  nPedidoFK INT,
  cNombrePasarela VARCHAR(255),
  cIdTransaccionExterna VARCHAR(255),
  cMetodoPago VARCHAR(255),
  eFranquicia ENUM('Visa', 'Mastercard', 'AMEX'),
  cUltimos4Digitos VARCHAR(4),
  nCuotas INT,
  nValorTransaccion DECIMAL(19,4),
  cEstadoTransaccion VARCHAR(255),
  cCodigoAprobacionBanco VARCHAR(255),
  dFechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dFechaActualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  jRawResponse JSON,
  FOREIGN KEY (nPedidoFK) REFERENCES TPedido(nPedidoID)
) ENGINE=InnoDB;

-- ======================================================
-- 6. MÓDULO ADMIN Y PQRS
-- ======================================================

CREATE TABLE TUsuarioAdmin (
  nIdUsuario INT PRIMARY KEY AUTO_INCREMENT,
  cNombre VARCHAR(255),
  cApellido VARCHAR(255),
  cCorreo VARCHAR(255),
  cPassword VARCHAR(255),
  eEstado ENUM('Activo', 'Inactivo', 'Bloqueado'),
  dCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE TTiendaAdmin (
  nIdTienda INT PRIMARY KEY AUTO_INCREMENT,
  cNombre VARCHAR(255),
  cDireccion VARCHAR(255),
  cTelefono VARCHAR(255),
  eEstado ENUM('Activa', 'Inactiva', 'Suspendida', 'Pendiente')
) ENGINE=InnoDB;

CREATE TABLE TPQRS (
  nPQRSID INT PRIMARY KEY AUTO_INCREMENT,
  nCreadorFK INT,
  cTipoCreador ENUM('Usuario', 'Tienda', 'Admin'),
  dFechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  eTipo ENUM('Peticion', 'Queja', 'Reclamo', 'Sugerencia'),
  eEstado ENUM('Activo', 'Resuelto', 'Pendiente'),
  cNumeroTicket VARCHAR(255),
  cAsunto VARCHAR(255),
  nPedidoFK INT,
  nTiendaFK INT,
  FOREIGN KEY (nPedidoFK) REFERENCES TPedido(nPedidoID),
  FOREIGN KEY (nTiendaFK) REFERENCES TTiendaAdmin(nIdTienda)
) ENGINE=InnoDB;

CREATE TABLE THiloPQRS (
  nHiloPQRSID INT PRIMARY KEY AUTO_INCREMENT,
  nPQRSFK INT,
  cMensaje TEXT,
  dFechaEnvio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  nActorFK INT,
  cTipoActor ENUM('Usuario', 'Tienda', 'Admin'),
  bEsMensajeInterno BOOLEAN,
  cEvidencia VARCHAR(255),
  FOREIGN KEY (nPQRSFK) REFERENCES TPQRS(nPQRSID)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
