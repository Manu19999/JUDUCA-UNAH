import React from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import Nav from '../components/Dashboard/navDashboard';
import UsuariosImage from "../../src/assets/Seguridad/usuarios.jpg";
import RolesImage from "../../src/assets/Seguridad/roles.jpg";
import UniversidadesImage from "../../src/assets/Seguridad/Universidad.jpg";
import ParametrosImage from "../../src/assets/Seguridad/parametros.jpg";
import BitacoraImage from "../../src/assets/Seguridad/bitacora.jpg";
import ObjetosImage from "../../src/assets/Seguridad/objetos.jpg";
import BotonRegresar from "../components/Dashboard/BotonRegresar";
import "../styles/Inicio/Caja-seguridad.css";

const CajaSeguridad = () => {
  const navigate = useNavigate();

  const items = [
    {
      id: 1,
      title: "Usuarios",
      image: UsuariosImage,
      description: "Gestión de usuarios del sistema.",
      route: "/usuarios",
    },
    {
      id: 2,
      title: "Roles",
      image: RolesImage,
      description: "Administración de roles y permisos.",
      route: "/roles",
    },
    {
      id: 3,
      title: "Universidades",
      image: UniversidadesImage,
      description: "Listado y gestión de universidades.",
      route: "/universidades",
    },
    {
      id: 4,
      title: "Parámetros",
      image: ParametrosImage,
      description: "Configuración de parámetros del sistema.",
      route: "/parametros",
    },
    {
      id: 5,
      title: "Bitácoras",
      image: BitacoraImage,
      description: "Registro y auditoría de acciones.",
      route: "/bitacoras",
    },
    {
      id: 6,
      title: "Objetos",
      image: ObjetosImage,
      description: "Gestión de Objetos.",
      route: "/objetos",
    },
  ];

  const handleImageClick = (route) => {
    navigate(route);
  };

  return (
    <section id="caja-seguridad" className="caja-seguridad-container">
      <Container>
        <Nav />
        <div className="espaciotexto">
          <BotonRegresar to="/dashboard" text="Regresar" />
          <h2 className="caja-seguridad-title">Gestión de seguridad</h2>
          <div className="caja-seguridad-grid">
            {items.map((item) => (
              <div key={item.id} className="caja-seguridad-card" 
              onClick={() => handleImageClick(item.route)}>
                <div className="caja-seguridad-image-container">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="caja-seguridad-image"
                  />
                </div>
                <h3>{item.title}</h3>
                <p className="card-seguridad-description">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CajaSeguridad;