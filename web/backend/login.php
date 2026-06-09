<?php
session_start();
require 'db.php';
header('Content-Type: application/json');

$doc  = $_POST['documento'] ?? '';
$pass = $_POST['password'] ?? '';

$sql = "SELECT nUsuarioClienteID, cNombre, cApellido FROM TUsuarioCliente 
        WHERE cDocumento=? AND cContrasena=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $doc, $pass);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $_SESSION['user_id'] = $row['nUsuarioClienteID'];
    echo json_encode(["OK" => true, "user" => $row]);
} else {
    echo json_encode(["OK" => false, "error" => "Credenciales inválidas"]);
}
