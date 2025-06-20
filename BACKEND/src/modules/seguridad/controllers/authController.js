import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import conexionbd from '../../../config/db.js';
import sql from 'mssql'; // Asegúrate de importar sql
import apiResponse from '../../../utils/apiResponse.js';
import bcrypt from 'bcrypt';// encriptado de contraseña
dotenv.config();
export const Login = async (req, res) => {
    const { email, contrasena } = req.body;
    const response = new apiResponse();

    try {
        const pool = await conexionbd();
        
        // 1. Obtener usuario (solo email)
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .execute('Usuarios.splUsuariosAutenticar');

        // 2. Manejar errores
        if (result.returnValue === 1 || result.returnValue === 2) {
            const error = result.recordset[0]?.descripcion || 'El correo electrónico o la contraseña son incorrectos';
            response.setErrors([error]);
            response.setHasError(true);
            return res.status(401).json(response.getResponse());
        }
        

        const user = result.recordset[0];
        
        // 3. Verificar contraseña con bcrypt
        const contraseñaValida = await bcrypt.compare(contrasena, user.contrasena);
        
        if (!contraseñaValida) {
            response.setErrors(['El correo electrónico o la contraseña son incorrectos']);
            response.setHasError(true);
            return res.status(401).json(response.getResponse());
        }

        // 4. Actualizar última conexión (opcional, podrías hacerlo en el SP)
        await pool.request()
            .input('idUsuario', sql.Int, user.idUsuario)
            .execute('Usuarios.splActualizarUltimaConexion');

        // 5. Generar token JWT
        const token = jwt.sign(
            {
                idUsuario: user.idUsuario,
                email: user.email,
                nombreUsuario: user.nombreUsuario,
                idRol: user.idRol
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 6. Configurar cookie segura
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000,
            path: '/'
        });

        // 7. Limpiar datos sensibles en respuesta
        const userResponse = { ...user };
        delete userResponse.contrasena;
        
        response.setData({ 
            message: 'Autenticación exitosa',
            usuario: userResponse
        });
        
        return res.status(200).json(response.getResponse());

    } catch (err) {
        console.error('Error en el login:', err);
        response.setErrors(['Error en el servidor. Por favor, inténtalo de nuevo más tarde']);
        response.setHasError(true);
        return res.status(500).json(response.getResponse());
    }
};

export const Logout = async (req, res) => {
    const response = new apiResponse();

    try {
        // 1. Limpiar la cookie (usando el mismo nombre que en login)
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'  // Asegurar mismo path que la cookie original
        });
        
        // 2. Registrar el logout si hay usuario autenticado
        if (req.usuario && req.usuario.idUsuario) {
            const pool = await conexionbd();
            
            await pool.request()
                .input('idUsuario', sql.Int, req.usuario.idUsuario)
                .input('nombreUsuario', sql.NVarChar, req.usuario.nombreUsuario || 'Sistema')
                .execute('Usuarios.splRegistrarLogout');
        }

        // 3. Preparar respuesta exitosa
        response.setData({ 
            message: 'Sesión cerrada correctamente'
        });

        // 4. Enviar respuesta inmediatamente
        return res.status(200).json(response.getResponse());

    } catch (err) {
        console.error('Error en el logout:', err);
        response.setErrors(['Error al cerrar sesión']);
        response.setHasError(true);
        return res.status(500).json(response.getResponse());
    }
};


export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const response = new apiResponse();
  
    try {
      const pool = await conexionbd();
      const result = await pool.request()
        .input('email', sql.VarChar, email)
        .execute('[Usuarios].[splVerificarCorreoRecuperacion]');
  
      // Verificar si el SP retornó resultados
      if (result.recordset.length === 0) {
        response.setErrors(['Error inesperado al verificar el email']);
        return res.status(500).json(response.getResponse());
      }
      
      const spResult = result.recordset[0];
      
      if (spResult.exito === 0) {
        // Email no existe o usuario inactivo
        response.setData({
          success: false,
          message: spResult.mensaje,
          emailExists: false
        });
      } else {
        // Email existe y usuario activo
        response.setData({
          success: true,
          message: spResult.mensaje,
          emailExists: true,
          userId: spResult.idUsuario
        });
      }
      
      return res.status(200).json(response.getResponse());
  
    } catch (err) {
      console.error('Error en forgotPassword:', err);
      response.setErrors(['Error al procesar la solicitud']);
      return res.status(500).json(response.getResponse());
    }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const response = new apiResponse();

  try {
    const pool = await conexionbd();
    
    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar contraseña en BD
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .input('contrasena', sql.VarChar, hashedPassword)
      .execute('Usuarios.splActualizarContrasena');

    // Verificar si el SP retornó error
    if (result.returnValue === -1) {
      const error = result.recordset[0]?.descripcion || 'Error al actualizar la contraseña';
      response.setErrors([error]);
      return res.status(400).json(response.getResponse());
    }

    // Incluir el email en la respuesta para que el frontend pueda usarlo
    response.setData({ 
      message: 'Contraseña actualizada exitosamente',
      email: email
    });
    return res.status(200).json(response.getResponse());

  } catch (err) {
    console.error('Error en resetPassword:', err);
    response.setErrors(['Error al actualizar la contraseña']);
    response.setHasError(true);
    return res.status(500).json(response.getResponse());
  }
};