<?php
session_start();
require 'db.php'; // aquí tienes tu conexión $conn
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);
$accion = $input['accion'] ?? '';

if ($accion === 'login') {
    $correo = $input['email'] ?? '';
    $pass   = $input['password'] ?? '';

    if ($correo === '' || $pass === '') {
        echo json_encode(["ok" => false, "mensaje" => "Correo y contraseña son obligatorios"]);
        exit;
    }

    $stmt = $conn->prepare("SELECT nUsuarioClienteID, cNombre, cApellido, cContrasena 
                            FROM TUsuarioCliente WHERE cCorreo = ?");
    $stmt->bind_param("s", $correo);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user && password_verify($pass, $user['cContrasena'])) {
        $_SESSION['cliente_id'] = $user['nUsuarioClienteID'];
        $_SESSION['cliente_nombre'] = $user['cNombre'] . ' ' . $user['cApellido'];
        echo json_encode(["ok" => true, "usuario" => [
            "id" => $user['nUsuarioClienteID'],
            "nombre" => $user['cNombre'],
            "apellido" => $user['cApellido'],
            "email" => $correo
        ]]);
    } else {
        echo json_encode(["ok" => false, "mensaje" => "Credenciales inválidas"]);
    }
}

elseif ($accion === 'registro') {
    $nombre       = $input['nombre'] ?? '';
    $apellido     = $input['apellido'] ?? '';
    $correo       = $input['email'] ?? '';
    $passPlain    = $input['password'] ?? '';
    $pass         = $passPlain ? password_hash($passPlain, PASSWORD_DEFAULT) : '';

    $nomenclatura = $input['nomenclatura'] ?? '';
    $barrio       = $input['barrio'] ?? '';
    $codpostal    = $input['codpostal'] ?? '';
    $municipio    = $input['municipio'] ?? null;

    if ($nombre === '' || $apellido === '' || $correo === '' || !$pass || !$municipio) {
        echo json_encode(["ok" => false, "mensaje" => "Datos incompletos"]);
        exit;
    }

    try {
        // 1. Insertar dirección
        $stmt = $conn->prepare("INSERT INTO TDireccion (cNomenclatura, cBarrio, cCodigoPostal, nMunicipioFK) VALUES (?,?,?,?)");
        $stmt->bind_param("sssi", $nomenclatura, $barrio, $codpostal, $municipio);
        $stmt->execute();
        $direccionID = $conn->insert_id;

        // 2. Insertar usuario con FK a dirección
        $stmt2 = $conn->prepare("INSERT INTO TUsuarioCliente (cNombre, cApellido, cContrasena, cCorreo, nDireccionFK) VALUES (?,?,?,?,?)");
        $stmt2->bind_param("ssssi", $nombre, $apellido, $pass, $correo, $direccionID);
        $stmt2->execute();

        echo json_encode(["ok" => true]);
    } catch (Exception $e) {
        echo json_encode(["ok" => false, "mensaje" => "Error al registrar"]);
    }
}

else {
    echo json_encode(["ok" => false, "mensaje" => "Acción inválida"]);
}
