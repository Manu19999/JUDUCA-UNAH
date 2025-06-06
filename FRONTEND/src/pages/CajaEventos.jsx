import React, { useState, useEffect } from "react";
import { Container, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaCog } from "react-icons/fa";
import Nav from "../components/Dashboard/navDashboard";
import "../styles/Inicio/Caja-seguridad.css";
import "../styles/Evento/Eventos.css";
import BotonRegresar from "../components/Dashboard/BotonRegresar";


// 🔹 Imágenes establecidas previamente
import JUDUCA from "../assets/Eventos/JUDUCA.jpg";
import FUCAIN from "../assets/Eventos/FUCAIN.jpg";
import DANZA from "../assets/Eventos/DANZA.jpg";

const CajaEventos = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Función para asignar imágenes predefinidas o usar JUDUCA por defecto
  const obtenerImagenEvento = (nombreEvento) => {
    if (!nombreEvento) return JUDUCA; // Si no hay nombre, usar imagen de JUDUCA
    const nombre = nombreEvento.toLowerCase();
    if (nombre.includes("evento 1")) return JUDUCA;
    if (nombre.includes("evento 2")) return FUCAIN;
    if (nombre.includes("evento 3")) return DANZA;
    return JUDUCA; // Si no coincide con nada, usar JUDUCA
  };

  // 🔹 Cargar eventos desde la API
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/credencial/", {
          method: "GET",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          }
        })
        
        const data = await response.json();

        console.log("Datos de eventos recibidos:", data); // 🔹 Verifica los datos en la consola

        if (data.hasError) {
          throw new Error(data.errors.join(", "));
        }

        const eventosConDatos = data.data.map((evento) => ({
          id: evento.idEvento,
          title: evento.nombreEvento || "Evento sin nombre", // Si no tiene nombre, asignar por defecto
          image: obtenerImagenEvento(evento.nombreEvento),
           // Asigna imagen basada en el nombre del evento
          description: evento.descripcion || "Sin descripción",
          route: "/gestion-evento",
        }));

        setEventos(eventosConDatos);
      } catch (err) {
        console.error("Error al obtener eventos:", err.message);
        setError("Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  const seleccionarEvento = (evento) => {
    localStorage.setItem("eventoActivo", JSON.stringify(evento)); // Guardar evento en localStorage
    navigate("/gestion-evento");
  };

    const handleMantenimientoEvento = () => {
    navigate("/MantenimientoEventos", {
    });
  };

  return (
    <section id="caja-seguridad" className="caja-seguridad-container">
      <Container>
        <Nav />

        <div className="espaciotexto">
          <BotonRegresar to="/dashboard" text="Regresar" />
          <h2 className="caja-seguridad-title">Gestión de Eventos</h2>

          <div className="eventtabs">
            <button
              className={`eventtab ${activeTab === "past" ? "active" : ""}`}
              onClick={() => setActiveTab("past")}
            >
              Pasados
            </button>
            <button
              className={`eventtab ${activeTab === "upcoming" ? "active" : ""}`}
              onClick={() => setActiveTab("upcoming")}
            >
              Próximos
            </button>
            <button className="eventtab"  onClick={() => handleMantenimientoEvento()}>
              Nuevo
            </button>
          </div>

          {/* Tarjetas de eventos */}
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p>Cargando eventos...</p>
            </div>
          ) : error ? (
            <p className="text-center text-danger">{error}</p>
          ) : (
            <div className="caja-seguridad-grid">
              {eventos.length === 0 ? (
                <p className="text-center">No hay eventos disponibles.</p>
              ) : (
                eventos.map((evento) => (
                  <div key={evento.id} className="caja-seguridad-card">
                    <div className="caja-seguridad-image-container">
                      <img
                        src={evento.image}
                        alt={evento.title}
                        className="caja-seguridad-image"
                        onClick={() => seleccionarEvento(evento)}
                      />
                    </div>
                    <h3>{evento.title}</h3>
                    <p className="card-seguridad-description">{evento.description}</p>
                    <div className="eventicons">
                      <FaEye className="eventicon" />
                      <FaCog className="eventicon" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default CajaEventos;
