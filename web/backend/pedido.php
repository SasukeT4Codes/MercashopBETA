<?php
session_start();
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["OK" => false, "error" => "No autenticado"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$productos = $_SESSION['carrito'] ?? [];

if (empty($productos)) {
    echo json_encode(["OK" => false, "error" => "Carrito vacío"]);
    exit;
}

// Insertar pedido
$conn->query("INSERT INTO TPedido (nClienteFK, nSubtotal, nTotal) VALUES ($user_id, 0, 0)");
$pedido_id = $conn->insert_id;

// Insertar detalle
foreach ($productos as $prod_id) {
    $conn->query("INSERT INTO TDetallePedido (nPedidoFK, nProductoFK, cNombreProducto, nPrecioCompra, nCantidad, nSubtotal)
                  SELECT $pedido_id, nProductoID, cDescripcionCorta, nPrecioUnitario, 1, nPrecioUnitario
                  FROM TProductos WHERE nProductoID=$prod_id");
}

// Vaciar carrito
$_SESSION['carrito'] = [];

echo json_encode(["OK" => true, "pedido_id" => $pedido_id]);
