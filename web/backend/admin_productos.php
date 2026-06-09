<?php
require 'db.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        $tiendaId = $_GET['tienda'] ?? 0;
        if (!$tiendaId) {
            echo json_encode(["OK" => false, "error" => "ID de tienda requerido"]);
            break;
        }

        $sql = "SELECT nProductoID, cDescripcionCorta, cDescripcionLarga,
                       nPrecioUnitario, nCantidadStock
                FROM TProductos
                WHERE nTiendaFK = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $tiendaId);
        $stmt->execute();
        $result = $stmt->get_result();

        $productos = [];
        while ($row = $result->fetch_assoc()) {
            $productos[] = $row;
        }

        echo json_encode(["OK" => true, "data" => $productos]);
        $stmt->close();
        break;

    case 'add':
        $tiendaId = $_POST['tienda_id'] ?? 0;
        $nombre   = $_POST['nombre'] ?? '';
        $desc     = $_POST['descripcion'] ?? '';
        $precio   = $_POST['precio'] ?? 0;
        $stock    = $_POST['stock'] ?? 0;

        if (!$tiendaId || $nombre === '' || $precio === '') {
            echo json_encode(["OK" => false, "error" => "Tienda, nombre y precio son obligatorios"]);
            break;
        }

        $sql = "INSERT INTO TProductos
                (nTiendaFK, cDescripcionCorta, cDescripcionLarga,
                 cUrlImagenPrincipal, nCategoriaFK, jEspecificaciones,
                 nPrecioUnitario, nCantidadStock)
                VALUES (?, ?, ?, '', NULL, NULL, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("issdi", $tiendaId, $nombre, $desc, $precio, $stock);
        $ok = $stmt->execute();

        if ($ok) {
            echo json_encode(["OK" => true]);
        } else {
            echo json_encode(["OK" => false, "error" => $stmt->error]);
        }
        $stmt->close();
        break;

    case 'update':
        $id       = $_POST['id'] ?? 0;
        $nombre   = $_POST['nombre'] ?? '';
        $desc     = $_POST['descripcion'] ?? '';
        $precio   = $_POST['precio'] ?? 0;
        $stock    = $_POST['stock'] ?? 0;

        if (!$id) {
            echo json_encode(["OK" => false, "error" => "ID de producto requerido"]);
            break;
        }

        $sql = "UPDATE TProductos
                SET cDescripcionCorta = ?, cDescripcionLarga = ?,
                    nPrecioUnitario = ?, nCantidadStock = ?
                WHERE nProductoID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssdii", $nombre, $desc, $precio, $stock, $id);
        $ok = $stmt->execute();

        if ($ok) {
            echo json_encode(["OK" => true]);
        } else {
            echo json_encode(["OK" => false, "error" => $stmt->error]);
        }
        $stmt->close();
        break;

    case 'delete':
        $id = $_POST['id'] ?? 0;
        if (!$id) {
            echo json_encode(["OK" => false, "error" => "ID de producto requerido"]);
            break;
        }

        $stmt = $conn->prepare("DELETE FROM TProductos WHERE nProductoID = ?");
        $stmt->bind_param("i", $id);
        $ok = $stmt->execute();

        if ($ok) {
            echo json_encode(["OK" => true]);
        } else {
            echo json_encode(["OK" => false, "error" => $stmt->error]);
        }
        $stmt->close();
        break;

    default:
        echo json_encode(["OK" => false, "error" => "Acción inválida"]);
}

$conn->close();