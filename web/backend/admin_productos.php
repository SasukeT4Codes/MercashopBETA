<?php
require 'db.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? 'list';

function subirImagen($campo) {
    if (!isset($_FILES[$campo]) || $_FILES[$campo]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    $tmp = $_FILES[$campo]['tmp_name'];
    $name = basename($_FILES[$campo]['name']);
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $permitidas = ['jpg', 'jpeg', 'png', 'webp'];

    if (!in_array($ext, $permitidas)) {
        return ["error" => "Formato de imagen no permitido"];
    }

    $carpeta = __DIR__ . '/../uploads/productos/';
    if (!is_dir($carpeta)) {
        mkdir($carpeta, 0777, true);
    }

    $nuevoNombre = uniqid('prod_', true) . '.' . $ext;
    $rutaFisica = $carpeta . $nuevoNombre;
    $rutaPublica = 'uploads/productos/' . $nuevoNombre;

    if (!move_uploaded_file($tmp, $rutaFisica)) {
        return ["error" => "No se pudo guardar la imagen"];
    }

    return $rutaPublica;
}

switch ($action) {
    case 'list':
        $tiendaId = $_GET['tienda'] ?? 0;
        if (!$tiendaId) {
            echo json_encode(["OK" => false, "error" => "ID de tienda requerido"]);
            break;
        }

        $sql = "SELECT nProductoID, cDescripcionCorta, cDescripcionLarga, cUrlImagenPrincipal, nPrecioUnitario, nCantidadStock
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
        $nombre = $_POST['nombre'] ?? '';
        $desc = $_POST['descripcion'] ?? '';
        $precio = $_POST['precio'] ?? 0;
        $stock = $_POST['stock'] ?? 0;

        if (!$tiendaId || $nombre === '' || $precio === '') {
            echo json_encode(["OK" => false, "error" => "Tienda, nombre y precio son obligatorios"]);
            break;
        }

        $imagen = subirImagen('imagen');
        if (is_array($imagen) && isset($imagen['error'])) {
            echo json_encode(["OK" => false, "error" => $imagen['error']]);
            break;
        }

        $sql = "INSERT INTO TProductos
                (nTiendaFK, cDescripcionCorta, cDescripcionLarga, cUrlImagenPrincipal, nCategoriaFK, jEspecificaciones, nPrecioUnitario, nCantidadStock)
                VALUES (?, ?, ?, ?, NULL, NULL, ?, ?)";
        $stmt = $conn->prepare($sql);
        $img = $imagen ?: '';
        $stmt->bind_param("isssdi", $tiendaId, $nombre, $desc, $img, $precio, $stock);
        $ok = $stmt->execute();

        if ($ok) {
            echo json_encode(["OK" => true]);
        } else {
            echo json_encode(["OK" => false, "error" => $stmt->error]);
        }
        $stmt->close();
        break;

    case 'update':
        $id = $_POST['id'] ?? 0;
        $nombre = $_POST['nombre'] ?? '';
        $desc = $_POST['descripcion'] ?? '';
        $precio = $_POST['precio'] ?? 0;
        $stock = $_POST['stock'] ?? 0;

        if (!$id) {
            echo json_encode(["OK" => false, "error" => "ID de producto requerido"]);
            break;
        }

        $imagen = subirImagen('imagen');
        if (is_array($imagen) && isset($imagen['error'])) {
            echo json_encode(["OK" => false, "error" => $imagen['error']]);
            break;
        }

        if ($imagen) {
            $sql = "UPDATE TProductos
                    SET cDescripcionCorta = ?, cDescripcionLarga = ?, cUrlImagenPrincipal = ?, nPrecioUnitario = ?, nCantidadStock = ?
                    WHERE nProductoID = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sssddi", $nombre, $desc, $imagen, $precio, $stock, $id);
        } else {
            $sql = "UPDATE TProductos
                    SET cDescripcionCorta = ?, cDescripcionLarga = ?, nPrecioUnitario = ?, nCantidadStock = ?
                    WHERE nProductoID = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssdii", $nombre, $desc, $precio, $stock, $id);
        }

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