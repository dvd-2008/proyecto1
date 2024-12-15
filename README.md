Primero creo la base de datos en mysql phpadmin  :
-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS tienda_online;

-- Usar la base de datos
USE tienda_online;

-- Crear la tabla clientes (solo datos relevantes)
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20)
);

-- Crear la tabla productos (solo datos relevantes)
CREATE TABLE IF NOT EXISTS productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_producto VARCHAR(255) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL
);

-- Crear la tabla pedidos (solo datos relevantes)
CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);

-- Crear la tabla detalles_pedido (solo datos relevantes)
CREATE TABLE IF NOT EXISTS detalles_pedido (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT,
    id_producto INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- Insertar datos en la tabla clientes
INSERT INTO clientes (nombre, telefono)
VALUES
    ('Juan Pérez', '555-1234'),
    ('Ana García', '555-5678'),
    ('Luis Martínez', '555-9876');

-- Insertar datos en la tabla productos
INSERT INTO productos (nombre_producto, precio, stock)
VALUES
    ('Camiseta', 15.99, 100),
    ('Pantalón', 29.99, 50),
    ('Zapatillas', 49.99, 200);

-- Insertar un pedido (para Juan Pérez)
INSERT INTO pedidos (id_cliente, total)
VALUES
    (1, 75.97);  -- Pedido de Juan Pérez

-- Insertar detalles del pedido para Juan Pérez
INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad, precio_unitario)
VALUES
    (1, 1, 2, 15.99), -- 2 Camisetas
    (1, 2, 1, 29.99); -- 1 Pantalón

-- Insertar otro pedido (para Ana García)
INSERT INTO pedidos (id_cliente, total)
VALUES
    (2, 99.98);  -- Pedido de Ana García

-- Insertar detalles del pedido para Ana García
INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad, precio_unitario)
VALUES
    (2, 1, 1, 15.99), -- 1 Camiseta
    (2, 3, 2, 49.99); -- 2 Zapatillas
![image](https://github.com/user-attachments/assets/e24a0fce-82e3-41f9-b2eb-0020256b4691)


///////////////////////////////////////////////////////////

luego creo la conexion.php y el index.php :

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
/////////////////////////////////////////////////////
index.php :
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


/////////////////////////////////////

creo un proyecto en react
y en el app.js :
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import axios from 'axios';

function App() {
  const baseUrl = "http://localhost/proyecto1/index.php";

  const [data, setData] = useState([]);
  const [modalInsertar, setModalInsertar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState({
    id_cliente: '',
    nombre: '',
    telefono: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClienteSeleccionado((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const abrirCerrarModalInsertar = () => {
    setModalInsertar(!modalInsertar);
    setClienteSeleccionado({ id_cliente: '', nombre: '', telefono: '' });
  };

  const abrirCerrarModalEditar = () => {
    setModalEditar(!modalEditar);
  };

  const abrirCerrarModalEliminar = () => {
    setModalEliminar(!modalEliminar);
  };

  const peticionGet = async () => {
    await axios.get(baseUrl)
      .then(response => {
        setData(response.data);
      }).catch(error => {
        console.log(error);
      });
  };

  const peticionPost = async () => {
    await axios.post(baseUrl, clienteSeleccionado, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      setData([...data, response.data]);
      abrirCerrarModalInsertar();
    })
    .catch(error => {
      console.log(error);
    });
  };

  const peticionPut = async () => {
    if (!clienteSeleccionado.nombre || !clienteSeleccionado.telefono) {
        alert("Por favor, complete los campos de nombre y teléfono.");
        return;
    }

    const clienteActualizado = {
        id_cliente: clienteSeleccionado.id_cliente,
        nombre: clienteSeleccionado.nombre,
        telefono: clienteSeleccionado.telefono,
    };

    await axios.put(`${baseUrl}`, clienteActualizado, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        const dataNueva = data.map(cliente =>
            cliente.id_cliente === clienteSeleccionado.id_cliente
                ? { ...cliente, ...response.data }
                : cliente
        );
        setData(dataNueva);
        abrirCerrarModalEditar();
    })
    .catch(error => {
        console.log(error);
        alert("Hubo un error al actualizar los datos.");
    });
  };

  const peticionDelete = async () => {
    await axios.delete(baseUrl, { params: { id: clienteSeleccionado.id_cliente } })
      .then(response => {
        setData(data.filter(cliente => cliente.id_cliente !== clienteSeleccionado.id_cliente));
        abrirCerrarModalEliminar();
      }).catch(error => {
        console.log(error);
      });
  };

  const seleccionarCliente = (cliente, caso) => {
    setClienteSeleccionado(cliente);
    if (caso === "Editar") {
      abrirCerrarModalEditar();
    } else {
      abrirCerrarModalEliminar();
    }
  };

  useEffect(() => {
    peticionGet();
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <br />
      <button className="btn btn-success" onClick={abrirCerrarModalInsertar}>Insertar</button>
      <br /><br />
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((cliente) => (
            <tr key={cliente.id_cliente}>
              <td>{cliente.id_cliente}</td>
              <td>{cliente.nombre}</td>
              <td>{cliente.telefono}</td>
              <td>
                <button className="btn btn-primary" onClick={() => seleccionarCliente(cliente, "Editar")}>Editar</button>{" "}
                <button className="btn btn-danger" onClick={() => seleccionarCliente(cliente, "Eliminar")}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={modalInsertar}>
        <ModalHeader>Insertar Cliente</ModalHeader>
        <ModalBody>
          <div className="form-group">
            <label>Nombre: </label>
            <input type="text" className="form-control" name="nombre" onChange={handleChange} value={clienteSeleccionado.nombre} />
            <br />
            <label>Teléfono: </label>
            <input type="text" className="form-control" name="telefono" onChange={handleChange} value={clienteSeleccionado.telefono} />
          </div>
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-primary" onClick={peticionPost}>Insertar</button>{" "}
          <button className="btn btn-danger" onClick={abrirCerrarModalInsertar}>Cancelar</button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={modalEditar}>
        <ModalHeader>Editar Cliente</ModalHeader>
        <ModalBody>
          <div className="form-group">
            <label>Nombre: </label>
            <input type="text" className="form-control" name="nombre" onChange={handleChange} value={clienteSeleccionado.nombre} />
            <br />
            <label>Teléfono: </label>
            <input type="text" className="form-control" name="telefono" onChange={handleChange} value={clienteSeleccionado.telefono} />
          </div>
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-primary" onClick={peticionPut}>Actualizar</button>{" "}
          <button className="btn btn-danger" onClick={abrirCerrarModalEditar}>Cancelar</button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={modalEliminar}>
        <ModalHeader>Eliminar Cliente</ModalHeader>
        <ModalBody>
          ¿Estás seguro de eliminar a {clienteSeleccionado.nombre}?
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-danger" onClick={peticionDelete}>Sí</button>{" "}
          <button className="btn btn-secondary" onClick={abrirCerrarModalEliminar}>No</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default App;
////////////////////////////////////////////////////////
![image](https://github.com/user-attachments/assets/83ee7eec-1c4b-47f8-9d35-d0fe959a96d1)

