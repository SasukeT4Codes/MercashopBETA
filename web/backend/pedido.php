<?php
session_start();
require 'db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);

$clienteID = $input['clienteID'] ?? null;
$carrito   = $input['carrito'] ?? [];
$subtotal  = $input['subtotal'] ?? 0;
$total     = $input['total'] ?? 0;

if (!$clienteID || empty($carrito)) {
    echo json_encode(["ok" => false, "mensaje" => "Carrito vacío o cliente no válido"]);
    exit;
}

try {
    // Crear pedido
    $stmt = $conn->prepare("INSERT INTO TPedido (nClienteFK, nSubtotal, nTotal, dFechaActualizacion) VALUES (?,?,?,NOW())");
    $stmt->bind_param("idd", $clienteID, $subtotal, $total);
    $stmt->execute();
    $pedidoID = $conn->insert_id;

    // Insertar detalle
    $stmtDetalle = $conn->prepare("INSERT INTO TDetallePedido (nPedidoFK, nProductoFK, cNombreProducto, nPrecioCompra, nCantidad, nSubtotal) VALUES (?,?,?,?,?,?)");

    foreach ($carrito as $item) {
        $subtotalItem = $item['precio'] * $item['cantidad'];
        $stmtDetalle->bind_param(
            "iisdis",
            $pedidoID,
            $item['id'],
            $item['nombre'],
            $item['precio'],
            $item['cantidad'],
            $subtotalItem
        );
        $stmtDetalle->execute();
    }

    echo json_encode(["ok" => true, "pedidoID" => $pedidoID]);
} catch (Exception $e) {
    echo json_encode(["ok" => false, "mensaje" => "Error al crear pedido"]);
}
