<?php
include 'conexion.php';

header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (isset($_GET['id'])) {
        $query = "SELECT * FROM clientes WHERE id_cliente=" . $_GET['id'];
        $resultado = metodoGet($query);
        echo json_encode($resultado[0]);
    } else {
        $query = "SELECT * FROM clientes";
        $resultado = metodoGet($query);
        echo json_encode($resultado);
    }
    header("HTTP/1.1 200 OK");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['nombre']) && isset($data['telefono'])) {
        $nombre = $data['nombre'];
        $telefono = $data['telefono'];
        $query = "INSERT INTO clientes (nombre, telefono) VALUES (:nombre, :telefono)";
        $stmt = conectar()->prepare($query);
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':telefono', $telefono);
        $stmt->execute();
        $idAutoIncrement = conectar()->lastInsertId();
        $resultado = [
            'id_cliente' => $idAutoIncrement,
            'nombre' => $nombre,
            'telefono' => $telefono
        ];
        echo json_encode($resultado);
        header("HTTP/1.1 200 OK");
        exit();
    } else {
        header("HTTP/1.1 400 Bad Request");
        echo json_encode(["error" => "Faltan datos"]);
        exit();
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['id_cliente']) && isset($data['nombre']) && isset($data['telefono'])) {
        $id = $data['id_cliente'];
        $nombre = $data['nombre'];
        $telefono = $data['telefono'];
        $query = "UPDATE clientes SET nombre = :nombre, telefono = :telefono WHERE id_cliente = :id_cliente";
        $stmt = conectar()->prepare($query);
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':telefono', $telefono);
        $stmt->bindParam(':id_cliente', $id);
        $stmt->execute();
        echo json_encode([
            'id_cliente' => $id,
            'nombre' => $nombre,
            'telefono' => $telefono
        ]);
        header("HTTP/1.1 200 OK");
        exit();
    } else {
        header("HTTP/1.1 400 Bad Request");
        echo json_encode(["error" => "Faltan datos"]);
        exit();
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $id = $_GET['id'];
    $query = "DELETE FROM clientes WHERE id_cliente='$id'";
    metodoDelete($query);
    echo json_encode(["id_cliente" => $id, "message" => "El cliente ha sido eliminado"]);
    header("HTTP/1.1 200 OK");
    exit();
}

header("HTTP/1.1 400 Bad Request");
?>
