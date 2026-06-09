<?php
require 'db.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        $sql = "SELECT nTiendaID, cNombreComercial, cCorreoAtencion FROM TTiendas";
        $result = $conn->query($sql);
        $tiendas = [];
        while ($row = $result->fetch_assoc()) {
            $tiendas[] = $row;
        }
        echo json_encode(["OK" => true, "data" => $tiendas]);
        break;

    case 'add':
        $nombre = $_POST['cNombreComercial'] ?? '';
        $desc   = $_POST['tDescripcion'] ?? '';
        $correo = $_POST['cCorreoAtencion'] ?? '';
        $tel    = $_POST['cTelefonoAtencion'] ?? '';
        $razon  = $_POST['cRazonSocial'] ?? '';

        if ($nombre === '' || $correo === '') {
            echo json_encode(["OK" => false, "error" => "Nombre y correo son obligatorios"]);
            break;
        }

        $stmt = $conn->prepare(
            "INSERT INTO TTiendas
             (cNombreComercial, tDescripcion, cCorreoAtencion, cTelefonoAtencion, cRazonSocial, eEstadoTienda)
             VALUES (?, ?, ?, ?, ?, 'Activa')"
        );
        $stmt->bind_param("sssss", $nombre, $desc, $correo, $tel, $razon);
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
            echo json_encode(["OK" => false, "error" => "ID inválido"]);
            break;
        }

        $stmt = $conn->prepare("DELETE FROM TTiendas WHERE nTiendaID = ?");
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