module.exports = {
  errorMessages: {
    ALREADY_EXISTS: {
      name: 'Usuario ya existente',
      description: 'Este usuario ya existe. Por favor, intente con otro usuario'
    },
    PREKEYBUNDLE_FAILED: {
      name: 'Error al crear el usuario',
      description: 'Ha ocurrido un error al generar el keybunle'
    },
    CREATE_USER_FAILED: {
      name: 'Error al crear el usuario',
      description: 'Ha ocurrido un error al crear el usuario.\nCódigo: '
    },
    SAVE_LOCAL: {
      name: 'Error al crear la cuenta',
      description:
        'Ha ocurrido un error al guardar el usuario en la base de datos'
    },
    SAVE_LABELS: {
      name: 'Error al crear la cuenta',
      description: 'Ha ocurrido un error al guardar las etiquetas'
    },
    SAVE_OWN_CONTACT: {
      name: 'Error al crear la cuenta',
      description:
        'Ha ocurrido un error al guardar la información de contacto en la base de datos'
    },
    POST_KEYBUNDLE: {
      name: 'Error al crear la cuenta',
      description: 'Ha ocurrido un error al subir el keybundle. Código: '
    },
    UPDATE_ACCOUNT_DATA: {
      name: 'Error al crear la cuenta',
      description:
        'Ha ocurrido un error al actualizar la información de la cuenta'
    },
    WRONG_CREDENTIALS: {
      name: 'Credenciales incorrectas',
      description:
        'Usuario o contraseña incorrectos. Verifique sus credenciales e intente de nuevo'
    },
    LOGIN_FAILED: {
      name: 'Falló el inicio de sesión',
      description:
        'Ha ocurrido un error durante el inicio de sesión. Por favor, intente de nuevo.\nCódigo: '
    },
    TOO_MANY_DEVICES: {
      name: 'Muchos dispositivos autorizados',
      description:
        'Tienes muchos dispositivos autorizados. \n' +
        'Desde uno de tus dispositivos, remueve algún dispositivo que ya no uses e intenta de nuevo. ' +
        'Si no puedes acceder a ninguno de tus dispositivos, por favor contacta a soporte'
    },
    TOO_MANY_REQUESTS: {
      name: 'Limite de peticiones excedido',
      description:
        'Has realizado muchas peticiones consecutivas.\n' +
        'Por favor, intenta nuevamente dentro de '
    },
    UNABLE_TO_CONNECT: {
      name: 'No se puede conectar',
      description:
        'No se ha podido establecer una conexión con el servidor.\n' +
        'Por favor, revisa el acceso a internet'
    },
    NO_RESPONSE: {
      name: 'No hay respuesta',
      description: 'No se ha obtenido respuesta del servidor'
    },
    UNAUTHORIZED: {
      name: 'Error de encriptación',
      description:
        'Ha ocurrido un error en tu solicitud.\nPor favor intenta de nuevo'
    },
    ENCRYPTING: {
      name: 'Error de encriptación',
      description:
        'Ha ocurrido un error durante el proceso de encriptación del mensaje.\nCódigo: '
    },
    NON_EXISTING_USERS: {
      name: 'Usuario no existente',
      description:
        'Uno o más usuarios que especificaste no existen.\n' +
        'Por favor, verifica los destinatarios e intenta de nuevo'
    },
    UPLOAD_FAILED: {
      name: 'Falló al subir el archivo',
      description:
        'Ha ocurrido un error mientras se subía el archivo.\n' +
        'Por favor, intenta de nuevo'
    },
    TOO_MANY_FILES: {
      name: 'Demasiados archivos adjuntos',
      description: 'Solo puedes adjuntar 5 archivos a un correo'
    },
    TOO_BIG_FILE: {
      name: 'Archivo demasiado grande',
      description: {
        prefix: 'El tamaño del archivo',
        suffix: 'es mayor a',
        defaultEnd: 'l tamaño permitido'
      }
    },
    PENDING_FILES: {
      name: 'Archivos pendientes',
      description:
        'Tienes archivos pendientes o que fallaron al subirse.\n' +
        'Por favor, verifica tus archivos e intenta de nuevo'
    },
    TOO_MANY_RECIPIENTS: {
      name: 'Muchos destinatarios',
      description:
        'Tus correos solo pueden contener hasta 300 destinatarios.\n' +
        'Por favor, verifica e intenta de nuevo'
    },
    UNKNOWN: {
      name: 'Error',
      description: 'Ha ocurrido un error al procesar tu solicitud.\nCódigo: '
    },
    LINK_DEVICES_UPLOAD_DATA: {
      name: 'Error al sincronizar',
      description:
        'Ha ocurrido un error al sincronizar los dispositivos.\nCódigo: '
    }
  },
  updaterMessages: {
    error: {
      name: 'Error al actualizar',
      description:
        'Ha ocurrido un error al intentar descargar la actualización.\n' +
        'Por favor, intenta más tarde'
    },
    unknownError: 'Desconocido',
    notAvailable: {
      name: 'Actualización no dispobible',
      description: 'Ya estás en la última versión de Criptext'
    },
    availableManual: {
      name: 'Actualización disponible',
      description:
        'Una nueva versión de Criptext está disponible.\n' +
        '¿Te gustaría descargarla ahora?',
      confirmButton: 'Sí',
      cancelButton: 'No'
    },
    availableAuto: {
      title: '¡Una nueva versión de Criptext está disponible!',
      subtitle:
        'Da clic aquí o descarta esta notificación para actualizar después'
    },
    downloading: {
      title: 'Descargando actualización',
      subtitle: 'Cuando la descarga haya finalizado, te notificaremos'
    },
    alreadyDownloading: {
      title: 'Descargando actualización',
      subtitle: 'Ya se está descargando una actualización'
    },
    downloaded: {
      title: 'Instalar actualización',
      subtitle:
        'Descarga terminada. A continuación, Criptext se reiniciará para actualizarse'
    }
  }
};
