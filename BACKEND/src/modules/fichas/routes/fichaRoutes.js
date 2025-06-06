import express from "express";
import { ObtenerFichas, insertarFichaRegistroCaracteristicas, InsertarParticipanteEvento, ObtenerOpcionesCaracteristicas, ObtenerCamposPorFicha,  obtenerCatalogosFichaRegistro } from "../controllers/fichaController.js";
import checkAuth from "../../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:idEvento", ObtenerFichas); // Añadido idEvento aquí
router.get("/catalogo/CaracteristicasFicha", obtenerCatalogosFichaRegistro); // Añadido idEvento aquí
router.get("/catalogo/OpcionesCaracteristicas/:idCatalogoCaracteristica", ObtenerOpcionesCaracteristicas); 
router.get("/camposFicha/:idFichaRegistro", ObtenerCamposPorFicha); 



router.post("/insFichaCaracteristicas",checkAuth,  insertarFichaRegistroCaracteristicas); 
router.post("/insParticipanteEventos",checkAuth,  InsertarParticipanteEvento); 


export default router;
