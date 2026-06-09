<?php
require 'db.php';

// Datos de prueba para el superadmin
$nombre   = 'Admin';
$apellido = 'Principal';
$correo   = 'admin@mercashop.com';
$password = 'admin123';
$estado   = 'Activo';

$sql = "INSERT INTO TUsuarioAdmin (cNombre, cApellido, cCorreo, cPassword, eEstado)
        VALUES (?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssss", $nombre, $apellido, $correo, $password, $estado);

if ($stmt->execute()) {
    echo "OK: admin creado con correo $correo y contraseña $password";
} else {
    echo "ERROR al crear admin: " . $stmt->error;
}

$stmt->close();
$conn->close();