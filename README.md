# Sistema de Turnos (FastAPI + React Vite + Tailwind v4)

Aplicación web responsiva para gestionar turnos con roles de **Administrador**, **Asesor** y **Matrizador**, más una pantalla pública. Frontend en React + Vite + Tailwind v4, backend en FastAPI y base de datos MariaDB.

## Estructura de carpetas
```
backend/           # API FastAPI y esquema SQLAlchemy
  app/
    api/routes.py  # Endpoints REST
    core/          # Config de DB y autenticación
    services/      # Lógica de colas/prioridades
    models.py      # Modelos SQLAlchemy
    schemas.py     # Esquemas Pydantic
    main.py        # Punto de entrada FastAPI
  migrations/schema.sql  # DDL para MariaDB
  requirements.txt
frontend/          # React + Vite + Tailwind v4
  src/
    pages/         # Cliente, Matrizador, Asesor, Admin y Pantalla
    components/    # NavBar
    types.ts       # Tipos compartidos
    styles.css     # Estilos Tailwind
  package.json
```

## Esquema de base de datos (MariaDB)
`backend/migrations/schema.sql` define las tablas:
- `users`: credenciales, nombre mostrado y rol (`ADMIN`, `ASESOR`, `MATRIZADOR`).
- `tickets`: turnos solicitados con prioridad para `TERCERA_EDAD` o `DISCAPACITADO`, tipo de servicio (`TRAMITE` o `ASESORIA`), estado (`PENDING`, `ASSIGNED`, `IN_PROGRESS`, `DONE`).
- `agent_states`: estado de cada agente (libre/ocupado) y turno actual.

## Instalación en desarrollo (Rocky Linux 10)
1. **Dependencias del sistema**
   ```bash
   sudo dnf install -y git python3.12 python3.12-venv mariadb-server nodejs npm
   ```
2. **Base de datos**
   ```bash
   sudo systemctl enable --now mariadb
   mysql -u root -p <<'SQL'
   CREATE DATABASE IF NOT EXISTS turnos_db CHARACTER SET utf8mb4;
   CREATE USER IF NOT EXISTS 'turnos_user'@'%' IDENTIFIED BY 'turnos_password';
   GRANT ALL PRIVILEGES ON turnos_db.* TO 'turnos_user'@'%';
   FLUSH PRIVILEGES;
   SQL
   mysql -u root -p turnos_db < backend/migrations/schema.sql
   ```
3. **Backend (FastAPI)**
   ```bash
   cd backend
   python3.12 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env  # Ajusta credenciales si aplica
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
4. **Frontend (Vite + Tailwind)**
   ```bash
   cd frontend
   npm install
   npm run dev -- --host --port 5173
   ```
5. **Acceso**
   - Frontend: http://localhost:5173
   - API: http://localhost:8000 (CORS deshabilitado por defecto).

## Despliegue en producción (Rocky Linux 10, IP 192.168.86.79)
1. **Variables de entorno**: define `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `SECRET_KEY` en `/etc/turnos/backend.env`.
2. **Servicio backend con Uvicorn + systemd**
   ```bash
   sudo useradd --system --home /opt/turnos --shell /sbin/nologin turnos
   sudo install -d -o turnos -g turnos /opt/turnos
   sudo cp -r backend /opt/turnos/
   cd /opt/turnos/backend
   python3.12 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   cat <<'UNIT' | sudo tee /etc/systemd/system/turnos.service
   [Unit]
   Description=Turnos FastAPI
   After=network.target mariadb.service

   [Service]
   User=turnos
   Group=turnos
   WorkingDirectory=/opt/turnos/backend
   EnvironmentFile=/etc/turnos/backend.env
   ExecStart=/opt/turnos/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
   Restart=always

   [Install]
   WantedBy=multi-user.target
   UNIT
   sudo systemctl daemon-reload
   sudo systemctl enable --now turnos
   ```
3. **Frontend compilado**
   ```bash
   cd frontend
   npm install
   npm run build
   sudo cp -r dist /opt/turnos/frontend
   ```
4. **Nginx como reverse proxy (sin CORS, solo API)**
   ```bash
   sudo dnf install -y nginx
   cat <<'NGINX' | sudo tee /etc/nginx/conf.d/turnos.conf
   server {
     listen 80;
     server_name 192.168.86.79;

     root /opt/turnos/frontend/dist;
     index index.html;

     location /api/ {
       proxy_pass http://127.0.0.1:8000/api/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }

     location / {
       try_files $uri /index.html;
     }
   }
   NGINX
   sudo systemctl enable --now nginx
   ```
5. **Seguridad básica**
   - Cambia `SECRET_KEY` en producción.
   - Crea usuarios en la tabla `users` con contraseñas encriptadas (usa `passlib` o endpoint de administración si se agrega).
   - Limita el firewall a los puertos necesarios (80/443 y 8000 interno).

## Autenticación y roles
- Autenticación Bearer token vía `/api/auth/login` (usuario/contraseña). Secret gestionado con `SECRET_KEY`.
- Roles:
  - **ADMIN**: acceso total, reportes y cambio de estados de agentes.
  - **ASESOR**: acceso a asesoría y cambio de estados.
  - **MATRIZADOR**: acceso a cola de trámites y pantalla.
- Pantalla pública no requiere token.

## Flujo de turnos
1. El cliente solicita turno (`/api/tickets`). Si es **tercera edad** o **discapacitado** se marca como prioridad.
2. Si hay matrizador/asesor libre, se asigna automáticamente; si no, se encola.
3. Los agentes toman el siguiente turno (`/agents/{id}/next`) y finalizan (`/tickets/{id}/complete`), cambiando su estado a libre.
4. La cola pública se consulta en `/tickets/queue` para la pantalla.

## Notas
- Tailwind v4 configurado con `tailwindcss@^4.0.0` y estilos centrales en `src/styles.css`.
- Para demo, los endpoints que requieren autenticación necesitan un usuario existente en DB. Inserta manualmente credenciales en la tabla `users` con contraseña hasheada (bcrypt).
