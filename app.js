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
