import React, { useEffect, useState } from "react";

import { firebase, firestore } from "./firebase";

function App() {
  //DB state
  const [tareas, setTareas] = useState([]);
  //form state
  const [tarea, setTarea] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [id, setId] = useState("");

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        //Getting db collections
        const db = firebase.firestore();
        const data = await db.collection("tareas").get();

        //Reading db collections
        const arrayData = data.docs.map((doc) => ({
          id: doc.id,
          //flating the array collection
          ...doc.data(),
        }));

        setTareas(arrayData);
      } catch (error) {
        console.log(error);
      }
    };

    obtenerDatos();
  }, []);

  //form handler
  const agregar = async (e) => {
    e.preventDefault();

    if (!tarea.trim()) {
      console.log("Ingrese datos");
      return;
    }

    try {
      const db = firebase.firestore();
      const nuevaTarea = {
        name: tarea,
        fecha: Date.now(),
      };
      const data = await db
        .collection("tareas")
        .add(nuevaTarea);

      setTareas([
        ...tareas,
        { ...nuevaTarea, id: data.id },
      ]);
      setTarea("");
    } catch (error) {
      console.log(error);
    }
    console.log(tarea);
  };

  const eliminarTarea = async (id) => {
    try {
      const db = firebase.firestore();
      await db.collection("tareas").doc(id).delete();

      const arrayFiltrado = tareas.filter(
        (item) => item.id !== id
      );

      setTareas(arrayFiltrado);
    } catch (error) {
      console.log(error);
    }
  };

  const activarEdicion = (item) => {
    setModoEdicion(true);
    //ligando tarea para ponerla en el campo editar
    setTarea(item.name);
    setId(item.id);
  };

  //form update handler
  const editar = async (e) => {
    e.preventDefault();
    if (!tarea.trim()) {
      console.log("Tarea vacia");
      return;
    }

    try {
      //updating the task in firstore
      const db = firebase.firestore();
      await db.collection("tareas").doc(id).update({
        name: tarea,
      });
      const arrayEditado = tareas.map(
        (item) =>
          item.id === id
            ? {
                id: item.id,
                fecha: item.fecha,
                name: tarea,
              }
            : item
        /*item => retornamos el item sin modificacion*/
      );

      //updating form UI
      setTareas(arrayEditado);

      //cleaning the form
      setModoEdicion(false);
      setTarea("");
      setId("");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="container mt-3">
      <h1 className="text-center">CRUD Firestore</h1>
      <hr className="mb-3" />
      <div className="row ">
        <div className="col-md-6">
          <ul className="list-group">
            {tareas.map((item) => (
              <li
                className="list-group-item
              "
                key={item.id}
              >
                {item.name}

                <button
                  className="btn btn-danger btn-sm float-right"
                  onClick={() => eliminarTarea(item.id)}
                >
                  Eliminar
                </button>
                <button
                  className="btn btn-warning btn-sm float-right mr-2"
                  onClick={() => activarEdicion(item)}
                >
                  Editar
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-md-6">
          <h3>
            {modoEdicion ? "Editar Tarea" : "Agregar Tarea"}
          </h3>
          <form onSubmit={modoEdicion ? editar : agregar}>
            <input
              type="text"
              placeholder="Ingrese Tarea"
              className="form-control mb-2 "
              onChange={(e) => setTarea(e.target.value)}
              value={tarea}
            />
            <button
              className={
                modoEdicion
                  ? "btn btn-warning btn-block"
                  : "btn btn-dark btn-block"
              }
              type="submit"
            >
              {modoEdicion ? "Editar" : "Agregar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
