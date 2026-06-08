<?php
session_start();
require '../api/db.php'; // ruta correcta

$correo = $_POST['correo'] ?? '';
$pass   = $_POST['password'] ?? '';

$sql = "SELECT nIdUsuario, cNombre FROM TUsuarioAdmin WHERE cCorreo=? AND cPassword=? AND eEstado='Activo'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $correo, $pass);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $_SESSION['admin_id'] = $row['nIdUsuario'];
    $_SESSION['admin_nombre'] = $row['cNombre'];
    header("Location: index.html");
    exit;
} else {
    echo "Credenciales inválidas o usuario inactivo";
}
