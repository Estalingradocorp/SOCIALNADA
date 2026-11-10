# ecT — Clon de Tumblr (Versión Estática)

> Clon de Tumblr con estilo propio: solo fotos y GIFs.

**Demo en GitHub Pages:** https://estalingradocorp.github.io/SOCIALNADA/

---

## ¿Qué es ecT?

ecT es un clon simplificado de Tumblr inspirado en la estética de la web antigua. La particularidad es que **solo permite subir imágenes y GIFs**, sin texto, enlaces o videos — como pediste.

Esta versión **estática** funciona 100% en el navegador usando `localStorage`. No requiere servidor, base de datos ni backend. Ideal para demo en GitHub Pages.

---

## ✨ Características

- **Solo fotos y GIFs** — validación de tipo de archivo (PNG, JPG, WebP, GIF)
- **Cuentas locales** — elige un nombre de usuario, se guarda en tu navegador
- **Feed en tiempo real** — publicaciones ordenadas por fecha
- **Likes, reblogs, seguidores** — todo guardado en localStorage
- **Etiquetas y búsqueda** — filtra por hashtag o texto
- **Perfiles de usuario** — `@usuario` con contador de posts
- **Radar y tendencias** — usuarios activos y tags populares
- **Vista previa de imagen/GIF** — drag & drop o clic
- **Diseño responsivo** — inspirado en Tumblr clásico

---

## ⚠️ Limitaciones de la versión estática

| Funcionalidad | Estado |
|---|---|
| Usuarios reales compartidos | ❌ Solo local (cada navegador = cuenta separada) |
| Base de datos persistente | ❌ `localStorage` se borra al limpiar caché |
| Subida real de archivos | ❌ Imágenes se guardan como base64 en localStorage (límite ~5-10MB total) |
| Validación servidor (magic bytes) | ❌ Solo validación cliente |
| Acceso multi-dispositivo | ❌ Datos atados al navegador |

> Para una versión con usuarios reales, base de datos y subida persistente, usa la versión con servidor Node.js (README de la versión completa).

---

## 🚀 Usar en GitHub Pages

1. Clona el repo:
```bash
git clone https://github.com/Estalingradocorp/SOCIALNADA.git
cd SOCIALNADA
```

2. Sube a GitHub Pages:
   - Settings → Pages
   - Source: `Deploy from a branch`
   - Branch: `main` / folder: `/public`
   - Save

3. Listo: `https://estalingradocorp.github.io/SOCIALNADA/`

---

## 📁 Estructura

```
public/
├── index.html      # Estructura de la app
├── style.css       # Estilos (variables CSS, layout tipo Tumblr)
├── app.js          # Lógica: localStorage, posts, auth simulada
└── .nojekyll       # Evita que Jekyll ignore archivos
```

---

## 🛠️ Tecnologías

- HTML5 + CSS3 (variables CSS)
- JavaScript vanilla (ES6+)
- localStorage API
- FileReader API para precarga de imágenes

**Sin dependencias externas.** Todo corre offline.

---

## 🎨 Personalización

### Cambiar colores
Edita `:root` en `style.css`:
```css
:root{
  --bg:#1b2233;
  --card:#fff;
  --accent:#ff6b4a;
  /* ... */
}
```

### Añadir posts de ejemplo
Edita el array de `posts` iniciales en `app.js` (líneas de seed).

### Límite de tamaño
Cambia `MAX_SIZE` en `app.js` según el límite de localStorage del navegador.

---

## 📝 Licencia

MIT — usa, modifica y distribuye como quieras.

---

## 🤝 Contribuciones

Pull requests bienvenidos. Para la versión con backend real, revisa el README de la rama `server`.

---

**Hecho con cariño para la web rara y personal.** 🌿
