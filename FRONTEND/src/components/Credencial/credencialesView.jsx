import React, { useState, useEffect } from "react";
import { Container, Row, Col, Modal, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import TargetaCredencial from "../Credencial/targetaCredencial";
import EventImage6 from "../../assets/Credencial.jpg";
import ModalDetalles from "../../components/Crud/Modal/ModalDetalles";
import "../../styles/Credencial/credencial.css";
import BotonRegresar from "../../components/Dashboard/BotonRegresar";
import "../../styles/Evento/Eventos.css";
import { fetchWithAuth } from '../../utils/api';


const GestionCredenciales = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState(null);
  const [fichasOptions, setFichasOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evento, setEvento] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);

  // Obtener evento activo desde localStorage
  useEffect(() => {
    const eventoGuardado = localStorage.getItem("eventoActivo");
    if (eventoGuardado) {
      setEvento(JSON.parse(eventoGuardado));
    }
  }, []);

  // Función para filtrar fichas según estado
  const getFilteredFichas = () => {
    if (!fichasOptions.length) return [];

    return fichasOptions.filter(ficha => {
      if (activeTab === "upcoming") {
        return ficha.activo === "Activo";
      } else {
        return ficha.activo === "Inactivo";
      }
    });
  };

  // Obtener fichas del servidor
  useEffect(() => {
    const obtenerFichas = async () => {
      if (!evento) return;

      try {
        const response = await fetchWithAuth("http://localhost:4000/api/fichas/fichasActivas", {
          method: "GET",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          }
        });

        const data = await response.json();

        if (data.hasError) {
          setError("No se pudieron obtener las fichas. Intente más tarde.");
          setLoading(false);
          return;
        }

        if (!data.data || data.data.length === 0) {
          setError("No hay fichas disponibles.");
          setLoading(false);
          return;
        }

        // Filtrar fichas para el evento actual
        const fichasFiltradas = data.data.filter(ficha => ficha.idEvento === evento.id);

        if (fichasFiltradas.length === 0) {
          setError("No hay fichas disponibles para este evento.");
          setLoading(false);
          return;
        }

        // Transformar datos para la UI
        const fichasConDatos = fichasFiltradas.map((ficha) => ({
          id: ficha.idFichaRegistro,
          title: ficha.nombreFicha,
          image: ficha.fotoFicha || EventImage6,
          description: ficha.comentarios || "Sin comentarios",
          idEvento: ficha.idEvento,
          activo: ficha.activo ? "Activo" : "Inactivo",
        }));

        setFichasOptions(fichasConDatos);
        setLoading(false);
      } catch (error) {
        setError("Error al conectar con el servidor.");
        setLoading(false);
      }
    };

    obtenerFichas();
  }, [evento]);

  const handleImageClick = (ficha) => {
    navigate(`/OpcionCredencial`, { state: { selectedFicha: ficha } });
  };

  const handleDetails = (id) => {
    const registro = fichasOptions.find((d) => d.id === id);
    setRegistroSeleccionado(registro);
    setShowDetailsModal(true);
  };

  const handleConfigurarCredencial = (id) => {
    navigate(`/asignacionCampos`);
  };

  return (
    <Container>
      <BotonRegresar to="/gestion-evento" text="Regresar" />

      <div className="credenciallisttitle text-center mt-3">
        <h2>
          {evento ? `FICHAS DEL EVENTO : ${evento.title}` : "Cargando evento..."}
        </h2>
      </div>

      <div className="eventtabs">
        <button
          className={`eventtab ${activeTab === "past" ? "active" : ""}`}
          onClick={() => setActiveTab("past")}
        >
          Inactivas
        </button>
        <button
          className={`eventtab ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          Activas
        </button>
      </div>

      {loading ? (
        <p className="text-center">Cargando fichas...</p>
      ) : error ? (
        <Alert variant="warning" className="text-center">
          {error}
        </Alert>
      ) : (
        <Row>
          {getFilteredFichas().length > 0 ? (
            getFilteredFichas().map((ficha) => (
              <Col key={ficha.id} xs={12} sm={6} md={4} lg={3} xl={2}>
                <TargetaCredencial
                  event={ficha}
                  onImageClick={() => handleImageClick(ficha)}
                  handleVerInfo={() => handleDetails(ficha.id)}
                  handleConfigurarCredencial={() => handleConfigurarCredencial(ficha.id)}
                  showIcons={true}
                />
              </Col>
            ))
          ) : (
            <Col xs={12} className="text-center mt-4">
              <p>No hay fichas {activeTab === "upcoming" ? "activas" : "inactivas"} disponibles</p>
            </Col>
          )}
        </Row>
      )}

      <ModalDetalles
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        titulo="Detalles de la ficha"
        detalles={registroSeleccionado || {}}
        width={800}
        tipo="ficha"
      />
    </Container>
  );
};

export default GestionCredenciales;