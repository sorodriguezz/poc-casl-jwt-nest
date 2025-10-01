# Ejemplo completo: NestJS + CASL + JWT + SQLite (TypeORM)

> Autenticación y autorización robusta con JWT (Bearer), CASL (control de permisos declarativo) y persistencia en SQLite usando TypeORM. Incluye seed automático, contraseñas seguras y pruebas con `curl`.

---

## Tabla de contenido

- [Requisitos](#requisitos)
- [Instalación y configuración](#instalación-y-configuración)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Explicación de la arquitectura](#explicación-de-la-arquitectura)
- [Seed automático](#seed-automático)
- [Comandos para probar el flujo completo](#comandos-para-probar-el-flujo-completo)
- [Notas de seguridad y extensibilidad](#notas-de-seguridad-y-extensibilidad)

---

## Requisitos

- Node.js 18+
- npm 9+

---

## Instalación y configuración

1. **Clona el repositorio y entra al directorio:**

   ```bash
   git clone https://github.com/sorodriguezz/poc-casl-jwt-nest.git
   cd nest-casl-app
   ```

2. **Instala las dependencias:**

   ```bash
   npm install
   ```

3. **Variables de entorno (opcional):**

   Por defecto, el secreto JWT es `dev_secret_change_me` y el puerto es `3000`. Puedes sobreescribirlos con:

   ```bash
   export JWT_SECRET=mi_super_secreto
   export PORT=4000
   ```

4. **Ejecuta el servidor en modo desarrollo:**

   ```bash
   npm run start:dev
   ```

   Al iniciar por primera vez, se ejecuta un seed automático que crea usuarios, roles y permisos básicos.

---

## Estructura del proyecto

```
src/
  app.module.ts
  main.ts
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    jwt.strategy.ts
    jwt-auth.guard.ts
    dto/
      login.dto.ts
  casl/
    casl-ability.factory.ts
  decorators/
    check-policies.decorator.ts
  guards/
    permissions.guard.ts
  rbac/
    permission.entity.ts
    role.entity.ts
  seed/
    seed.service.ts
  users/
    user.entity.ts
    users.controller.ts
    users.module.ts
    users.service.ts
    dto/
      create-user.dto.ts
```

---

## Explicación de la arquitectura

- **JWT (Bearer):** Autenticación segura, poblando `req.user` tras validar el token.
- **SQLite + TypeORM:** Persistencia de usuarios, roles y permisos. Relaciones ManyToMany y OneToMany.
- **CASL:** Evaluación declarativa de permisos, soportando condiciones dinámicas.
- **Decorador + Guard:** Uso de `@CheckPolicies` y `PermissionsGuard` para proteger rutas según políticas.
- **Seed automático:** Al iniciar, crea usuarios, roles y permisos de ejemplo con contraseñas hasheadas (bcrypt).

### Entidades principales

- **UserEntity:** Usuario con roles (relación ManyToMany).
- **RoleEntity:** Rol con permisos (OneToMany a PermissionEntity).
- **PermissionEntity:** Permiso (acción, sujeto, condiciones, etc.) asociado a un rol.

### Flujo de autenticación y autorización

1. **Login:** El usuario envía email y password. Si es válido, recibe un JWT.
2. **Acceso a rutas protegidas:** El JWT se envía como `Bearer` en el header. El guard valida y rehidrata roles/permisos desde la base de datos en cada request.
3. **CASL:** Evalúa si el usuario puede realizar la acción sobre el recurso, según sus permisos y políticas.

---

## Seed automático

Al iniciar el servidor por primera vez, se crean:

- **Usuarios:**
  - admin@example.com / admin123 (rol: admin)
  - user@example.com / user123 (rol: user)
- **Roles:** admin, user
- **Permisos:**
  - admin: manage all
  - user: read all

Puedes modificar o ampliar el seed en `src/seed/seed.service.ts`.

---

## Comandos para probar el flujo completo

### 1. Login (admin)

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Guarda el `accessToken` que retorna.

### 2. Listar usuarios (admin; permitido por manage)

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/users
```

### 3. Crear usuario como admin

```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Pepe","email":"pepe@example.com","password":"pepe123"}'
```

### 4. Login (usuario regular)

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}'
```

### 5. Crear usuario con regular (debería fallar)

```bash
curl -i -X POST http://localhost:3000/users \
  -H "Authorization: Bearer <TOKEN_USER>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan","email":"juan@example.com","password":"juan123"}'
```

### 6. Listar usuarios con regular (permitido por read)

```bash
curl -H "Authorization: Bearer <TOKEN_USER>" http://localhost:3000/users
```

### 7. Eliminar usuario con regular (debería fallar)

```bash
curl -i -X DELETE -H "Authorization: Bearer <TOKEN_USER>" \
  http://localhost:3000/users/1
```

---

## Notas de seguridad y extensibilidad

- El payload del JWT es mínimo (sub, email). Los roles y permisos se consultan en BD en cada request, reflejando cambios de inmediato.
- CASL permite condiciones dinámicas (por ejemplo, permitir update solo sobre su propio usuario).
- Puedes ampliar el sistema agregando más roles, permisos y condiciones en el seed o desde la base de datos.
- Para producción, cambia el secreto JWT y desactiva `synchronize: true` en TypeORM.
- El guard de permisos puede cachear reglas por usuario para optimizar lecturas a BD.
- Si necesitas refresh tokens, logout, o alias de acciones (manage ⇒ CRUD), puedes extender fácilmente la arquitectura.

---

## Créditos

Inspirado en la comunidad NestJS y la documentación oficial de CASL.
