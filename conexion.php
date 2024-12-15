<?php

$host = "localhost";
$user = "root";
$password = "";
$bd = "tienda_online";
$puerto = 3315; 


function conectar() {
    try {
        $pdo = new PDO("mysql:host=".$GLOBALS['host'].";port=".$GLOBALS['puerto'].";dbname=".$GLOBALS['bd'], $GLOBALS['user'], $GLOBALS['password']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        die("Error: No se pudo conectar a la base de datos ".$GLOBALS['bd'].". ".$e->getMessage());
    }
}


function desconectar($pdo) {
    $pdo = null;
}


function metodoGet($query) {
    try {
        $pdo = conectar();
        $sentencia = $pdo->prepare($query);
        $sentencia->execute();
        $resultado = $sentencia->fetchAll();
        desconectar($pdo);
        return $resultado;
    } catch (Exception $e) {
        die("Error: ".$e->getMessage());
    }
}


function metodoPost($query) {
    try {
        $pdo = conectar();
        $sentencia = $pdo->prepare($query);
        $sentencia->execute();

        $idAutoIncrement = $pdo->lastInsertId();
        desconectar($pdo);
        return $idAutoIncrement;
    } catch (Exception $e) {
        die("Error: ".$e->getMessage());
    }
}


function metodoPut($query) {
    try {
        $pdo = conectar();
        $sentencia = $pdo->prepare($query);
        $sentencia->execute();
        desconectar($pdo);
    } catch (Exception $e) {
        die("Error: ".$e->getMessage());
    }
}


function metodoDelete($query) {
    try {
        $pdo = conectar();
        $sentencia = $pdo->prepare($query);
        $sentencia->execute();
        desconectar($pdo);
    } catch (Exception $e) {
        die("Error: ".$e->getMessage());
    }
}
?>
