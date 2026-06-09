<?php
require 'db.php';
header('Content-Type: application/json');

try {
    $result = $conn->query("SELECT nDepartamentoID, cNombre FROM TDepartamento ORDER BY cNombre");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
} catch (Exception $e) {
    echo json_encode(["error" => true, "mensaje" => $e->getMessage()]);
}
