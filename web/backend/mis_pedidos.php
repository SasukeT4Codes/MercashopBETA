<?php
session_start();
require 'db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);
$clienteID = $input['clienteID'] ?? null;

if (!$clienteID) {
    echo json_encode(["ok" => false, "mensaje" => "Cliente no válido"]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT nPedidoID, nSubtotal, nTotal, dFechaActualizacion 
                            FROM TPedido WHERE nClienteFK = ? ORDER BY dFechaActualizacion DESC");
    $stmt->bind_param("i", $clienteID);
    $stmt->execute();
    $result = $stmt->get_result();
    $pedidos = [];
    while ($row = $result->fetch_assoc()) {
        // cargar detalles
        $stmt2 = $conn->prepare("SELECT cNombreProducto, nPrecioCompra, nCantidad, nSubtotal 
                                 FROM TDetallePedido WHERE nPedidoFK = ?");
        $stmt2->bind_param("i", $row['nPedidoID']);
        $stmt2->execute();
        $det = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
        $row['detalles'] = $det;
        $pedidos[] = $row;
    }
    echo json_encode(["ok" => true, "pedidos" => $pedidos]);
} catch (Exception $e) {
    echo json_encode(["ok" => false, "mensaje" => "Error al cargar pedidos"]);
}
