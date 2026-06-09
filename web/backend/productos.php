<?php
// Configuración de conexión a la base de datos
$host = getenv("DB_HOST") ?: "db";
$user = getenv("DB_USER") ?: "app";
$pass = getenv("DB_PASS") ?: "apppass";
$db   = getenv("DB_NAME") ?: "mercashop";

// Conexión a MySQL
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["OK" => false, "error" => "Error de conexión: " . $conn->connect_error]);
    exit;
}

// Consulta de productos
$sql = "SELECT nProductoID, cDescripcionCorta, cDescripcionLarga, cUrlImagenPrincipal, nPrecioUnitario, nCantidadStock 
        FROM TProductos";
$result = $conn->query($sql);

$productos = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $productos[] = $row;
    }
}

// Respuesta en JSON
header('Content-Type: application/json');
echo json_encode(["OK" => true, "data" => $productos]);

$conn->close();
