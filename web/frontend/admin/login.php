<?php
session_start();
require '../../backend/db.php';
header('Content-Type: application/json');

$correo = $_POST['correo'] ?? '';
$pass   = $_POST['password'] ?? '';

if ($correo === '' || $pass === '') {
    echo json_encode(["OK" => false, "error" => "Correo y contraseña son obligatorios"]);
    exit;
}

$sql = "SELECT nIdUsuario, cNombre, cApellido
        FROM TUsuarioAdmin
        WHERE cCorreo = ? AND cPassword = ? AND eEstado = 'Activo'";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $correo, $pass);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $_SESSION['admin_id']     = $row['nIdUsuario'];
    $_SESSION['admin_nombre'] = $row['cNombre'] . ' ' . $row['cApellido'];
    echo json_encode(["OK" => true]);
} else {
    echo json_encode(["OK" => false, "error" => "Credenciales inválidas o usuario inactivo"]);
}

$stmt->close();
$conn->close();