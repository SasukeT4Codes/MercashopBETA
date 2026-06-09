<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['carrito'])) {
    $_SESSION['carrito'] = [];
}

$action = $_GET['action'] ?? 'view';
$id     = $_POST['id'] ?? null;

switch ($action) {
    case 'add':
        if ($id) {
            $_SESSION['carrito'][] = $id;
        }
        break;
    case 'remove':
        if ($id) {
            $_SESSION['carrito'] = array_filter($_SESSION['carrito'], fn($p) => $p != $id);
        }
        break;
}

echo json_encode(["OK" => true, "data" => $_SESSION['carrito']]);
