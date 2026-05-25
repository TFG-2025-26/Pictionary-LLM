# PictoAI - Pictionary LLM

Este repositorio contiene el código fuente de la aplicación PictoAI, desarrollada como Trabajo de Fin de Grado bajo el título oficial de "Pictionary LLM". La aplicación es un juego de dibujo interactivo asistido por inteligencia artificial que consta de un servidor backend y un cliente web frontend.

Nota: El manual completo de instalación paso a paso, los requisitos de software del sistema y la guía de configuración detallada se encuentran especificados en el Apéndice A de la memoria del proyecto.

## Estructura del proyecto

El código está organizado en dos directorios principales dentro de la raíz:

* **/backend**: Servidor de la aplicación desarrollado en Python utilizando FastAPI. Gestiona la lógica lúdica, la autenticación y la carga local de los modelos de inteligencia artificial.
* **/frontend**: Interfaz de usuario adaptativa desarrollada en React con TypeScript, utilizando Vite como entorno de desarrollo y empaquetado.

## Resumen de comandos para ejecución rápido

Para levantar el entorno local de desarrollo de forma simultánea, ejecute los siguientes comandos en dos terminales independientes:

### Servidor (Backend)
1. Acceder al directorio: `cd backend`
2. Activar el entorno virtual de Python.
3. Iniciar el servidor local: `uvicorn main:app --reload`

El backend e hilos de comunicación se desplegarán en la dirección local http://localhost:8000.

### Cliente (Frontend)
1. Acceder al directorio: `cd frontend`
2. Iniciar el entorno de desarrollo: `npm run dev -- --host`

La interfaz web se desplegará en el puerto local asignado automáticamente (habitualmente http://localhost:5173).
