<?php
require 'db.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? 'list';

if ($action !== 'list') {
    echo json_encode(["OK" => false, "error" => "Acción inválida"]);
    exit;
}

$tiendaId = $_GET['tienda'] ?? 0;

if (!$tiendaId) {
    echo json_encode(["OK" => false, "error" => "ID de tienda requerido"]);
    exit;
}

$sql = "
SELECT
    p.nPedidoID,
    p.nClienteFK,
    CONCAT(
        COALESCE(c.cNombre, ''),
        ' ',
        COALESCE(c.cApellido, '')
    ) AS cCliente,
    p.nTotal,
    p.nSubtotal,
    p.dFechaActualizacion,
    ep.cNombreEstado
FROM TPedido p
INNER JOIN TUsuarioCliente c
    ON c.nUsuarioClienteID = p.nClienteFK
LEFT JOIN TEstadoPedido ep
    ON ep.nEstadoPedidoID = p.nEstadoPedidoFK
INNER JOIN TDetallePedido dp
    ON dp.nPedidoFK = p.nPedidoID
INNER JOIN TProductos pr
    ON pr.nProductoID = dp.nProductoFK
WHERE pr.nTiendaFK = ?
GROUP BY
    p.nPedidoID,
    p.nClienteFK,
    c.cNombre,
    c.cApellido,
    p.nTotal,
    p.nSubtotal,
    p.dFechaActualizacion,
    ep.cNombreEstado
ORDER BY p.nPedidoID DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $tiendaId);
$stmt->execute();
$result = $stmt->get_result();

$compras = [];
while ($row = $result->fetch_assoc()) {
    $compras[] = $row;
}

echo json_encode(["OK" => true, "data" => $compras]);

$stmt->close();
$conn->close();
?>