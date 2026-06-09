<?php
require 'db.php';
header('Content-Type: application/json');

$depID = $_GET['dep'] ?? null;

try {
    if ($depID) {
        $stmt = $conn->prepare("SELECT nMunicipioID, cNombre FROM TMunicipio WHERE nDepartamentoFK = ?");
        $stmt->bind_param("i", $depID);
        $stmt->execute();
        $result = $stmt->get_result();
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        echo json_encode($rows);
    } else {
        echo json_encode([]);
    }
} catch (Exception $e) {
    echo json_encode(["error" => true, "mensaje" => $e->getMessage()]);
}
