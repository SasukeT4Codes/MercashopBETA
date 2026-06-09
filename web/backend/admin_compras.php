<?php
require 'db.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? 'list';
if ($action !== 'list') {
    echo json_encode(["OK" => false, "error" => "Acción inválida"]);
    exit;
}

// Parámetros
$tiendaId = $_GET['tienda'] ?? null;
$page     = intval($_GET['page'] ?? 1);
$limit    = intval($_GET['limit'] ?? 20);
$offset   = ($page - 1) * $limit;
$orden    = $_GET['orden'] ?? 'fecha';

// Orden dinámico
$orderBy = "p.dFechaActualizacion DESC";
if ($orden === "total")   $orderBy = "p.nTotal DESC";
if ($orden === "cliente") $orderBy = "c.cNombre ASC";

try {
    if ($tiendaId) {
        // Contar total de compras por tienda
        $countSql = "
        SELECT COUNT(DISTINCT p.nPedidoID) AS total
        FROM TPedido p
        INNER JOIN TDetallePedido dp ON dp.nPedidoFK = p.nPedidoID
        INNER JOIN TProductos pr ON pr.nProductoID = dp.nProductoFK
        WHERE pr.nTiendaFK = ?";
        $countStmt = $conn->prepare($countSql);
        $countStmt->bind_param("i", $tiendaId);
        $countStmt->execute();
        $countResult = $countStmt->get_result()->fetch_assoc();
        $totalRegistros = $countResult['total'] ?? 0;
        $countStmt->close();

        // Compras filtradas por tienda
        $sql = "
        SELECT p.nPedidoID, p.nClienteFK,
               CONCAT(COALESCE(c.cNombre,''),' ',COALESCE(c.cApellido,'')) AS cCliente,
               p.nSubtotal, p.nTotal, p.dFechaActualizacion, ep.cNombreEstado
        FROM TPedido p
        INNER JOIN TUsuarioCliente c ON c.nUsuarioClienteID = p.nClienteFK
        LEFT JOIN TEstadoPedido ep ON ep.nEstadoPedidoID = p.nEstadoPedidoFK
        INNER JOIN TDetallePedido dp ON dp.nPedidoFK = p.nPedidoID
        INNER JOIN TProductos pr ON pr.nProductoID = dp.nProductoFK
        WHERE pr.nTiendaFK = ?
        GROUP BY p.nPedidoID
        ORDER BY $orderBy
        LIMIT ? OFFSET ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iii", $tiendaId, $limit, $offset);
    } else {
        // Contar todas las compras
        $countSql = "SELECT COUNT(*) AS total FROM TPedido";
        $countResult = $conn->query($countSql)->fetch_assoc();
        $totalRegistros = $countResult['total'] ?? 0;

        // Todas las compras
        $sql = "
        SELECT p.nPedidoID, p.nClienteFK,
               CONCAT(COALESCE(c.cNombre,''),' ',COALESCE(c.cApellido,'')) AS cCliente,
               p.nSubtotal, p.nTotal, p.dFechaActualizacion, ep.cNombreEstado
        FROM TPedido p
        INNER JOIN TUsuarioCliente c ON c.nUsuarioClienteID = p.nClienteFK
        LEFT JOIN TEstadoPedido ep ON ep.nEstadoPedidoID = p.nEstadoPedidoFK
        ORDER BY $orderBy
        LIMIT ? OFFSET ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $limit, $offset);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $compras = [];
    while ($row = $result->fetch_assoc()) {
        $compras[] = $row;
    }

    $totalPaginas = ceil($totalRegistros / $limit);

    echo json_encode([
        "OK" => true,
        "data" => $compras,
        "page" => $page,
        "totalPages" => $totalPaginas,
        "totalRecords" => $totalRegistros
    ]);

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["OK" => false, "error" => $e->getMessage()]);
}
