<?php
require '../backend/db.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        $sql = "SELECT nProductoID, cDescripcionCorta, nPrecioUnitario FROM TProductos";
        $result = $conn->query($sql);
        $productos = [];
        while ($row = $result->fetch_assoc()) {
            $productos[] = $row;
        }
        echo json_encode(["OK" => true, "data" => $productos]);
        break;

    case 'add':
        $nombre = $_POST['cDescripcionCorta'] ?? '';
        $desc   = $_POST['cDescripcionLarga'] ?? '';
        $precio = $_POST['nPrecioUnitario'] ?? 0;

        $stmt = $conn->prepare("INSERT INTO TProductos (cDescripcionCorta, cDescripcionLarga, nPrecioUnitario, nCantidadStock) VALUES (?, ?, ?, 10)");
        $stmt->bind_param("ssd", $nombre, $desc, $precio);
        $stmt->execute();

        echo json_encode(["OK" => true]);
        break;

    case 'delete':
        $id = $_POST['id'] ?? 0;
        $stmt = $conn->prepare("DELETE FROM TProductos WHERE nProductoID=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();

        echo json_encode(["OK" => true]);
        break;

    default:
        echo json_encode(["OK" => false, "error" => "Acción inválida"]);
}
$conn->close();
