import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const SUPABASE_URL = 'https://addmpwjxvyfpxrnzpdua.supabase.co';
const SUPABASE_KEY = 'TU_API_KEY_AQUI'; // ⚠️ Reemplaza con tu clave real si no usas variables seguras


document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container');
  const selectEstado = document.getElementById('select-filtro-estado');
  const inputBusqueda = document.getElementById('buscador');
  const phoneNumber = "8292308873"; // Número WhatsApp fijo

  // Función para cargar productos desde Supabase y mostrarlos
  async function cargarTodosLosProductos() {
    container.innerHTML = '<p>Cargando productos...</p>';

    const { data: productos, error } = await supabase
      .from('Productos')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      container.innerHTML = `<p>Error cargando productos: ${error.message}</p>`;
      return;
    }
    if (!productos || productos.length === 0) {
      container.innerHTML = '<p>No hay productos publicados.</p>';
      return;
    }

    container.innerHTML = '';

    productos.forEach(p => {
      const estadoClass = p.estado.toLowerCase().includes('nuevo') ? 'nuevo' :
                          p.estado.toLowerCase().includes('usado') ? 'usado' : 'otro';

      const imagenSrc = p.imagen_url || 'https://via.placeholder.com/300?text=Sin+imagen';

      const div = document.createElement('div');
      div.classList.add('product-card');
      div.classList.add(estadoClass);
      div.dataset.estado = estadoClass;

     div.innerHTML = `
  <h3 class="titulo">${p.titulo}</h3>
  <img class="main-image" 
       src="${p.imagen_url[0] || 'https://via.placeholder.com/300?text=Sin+imagen'}" 
       alt="${p.titulo}" 
       loading="lazy" 
       data-images='${JSON.stringify(p.imagen_url)}' />

        <p class="descripcion">
          <span class="short-desc">${p.descripcion.slice(0, 100)}</span>
          <span class="full-desc" style="display:none;">${p.descripcion}</span>
          ${p.descripcion.length > 100 ? `<a href="#" class="toggle-desc">Ver más</a>` : ''}
        </p>
        <p><strong>Precio:</strong> $<span class="precio">${p.precio}</span></p>
        <p><strong>Estado:</strong> ${p.estado}</p>
        <p><strong>Vendedor:</strong> ${p.vendedor}</p>
        <button class="buy-button">💵 Comprar</button>
      `;

      container.appendChild(div);
    });

    activarToggleDescripcion();
    activarBotonesComprar();
    aplicarFiltros();
    activarLightbox();
  }

  // Alternar descripción corta/larga
  function activarToggleDescripcion() {
    document.querySelectorAll('.toggle-desc').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const desc = btn.closest('.descripcion');
        const shortDesc = desc.querySelector('.short-desc');
        const fullDesc = desc.querySelector('.full-desc');
        const isExpanded = fullDesc.style.display === 'inline' || fullDesc.style.display === 'block';

        shortDesc.style.display = isExpanded ? 'inline' : 'none';
        fullDesc.style.display = isExpanded ? 'none' : 'inline';
        btn.textContent = isExpanded ? 'Ver más' : 'Ver menos';
      });
    });
  }

  // Configurar botones "Comprar" para abrir WhatsApp con mensaje
  function activarBotonesComprar() {
    document.querySelectorAll('.buy-button').forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault();

        const productCard = e.target.closest('.product-card');
        if (!productCard) return;

        const productTitle = productCard.querySelector('.titulo').textContent.trim();
        const productPrice = productCard.querySelector('.precio').textContent.trim();
        const fullDescEl = productCard.querySelector('.full-desc');
        const productDescription = fullDescEl ? fullDescEl.textContent.trim() : '';

        const mensaje = `Hola, estoy interesado en comprar:\n- Producto: ${productTitle}\n- Precio: $${productPrice}\n- Descripción: ${productDescription}`;
        const mensajeCodificado = encodeURIComponent(mensaje);
        const urlWhatsapp = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${mensajeCodificado}`;

        window.open(urlWhatsapp, '_blank');
      });
    });
  }

  // Filtrar productos visibles según filtros de estado y búsqueda
  function aplicarFiltros() {
    const estadoSel = selectEstado?.value.toLowerCase() || 'todos';
    const textoBusq = inputBusqueda?.value.toLowerCase() || '';

    document.querySelectorAll('.product-card').forEach(card => {
      const estadoProd = card.dataset.estado || 'otro';
      const titulo = card.querySelector('.titulo')?.textContent.toLowerCase() || '';
      const descripcion = card.querySelector('.descripcion')?.textContent.toLowerCase() || '';

      const coincideEstado = estadoSel === 'todos' || estadoProd === estadoSel;
      const coincideTexto = titulo.includes(textoBusq) || descripcion.includes(textoBusq);

      card.style.display = (coincideEstado && coincideTexto) ? 'block' : 'none';
    });
  }

  // Activar lightbox para imágenes de productos
  function activarLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.querySelector(".lightbox-image");
    const closeBtn = document.querySelector(".close-btn");
    let currentImages = [];
    let currentIndex = 0;

    if (lightbox && lightboxImg && closeBtn) {
      document.querySelectorAll('.main-image').forEach(img => {
        img.addEventListener('click', () => {
          currentImages = JSON.parse(img.dataset.images || '[]');
          currentIndex = 0;
          lightboxImg.src = currentImages[currentIndex];
          lightbox.style.display = "flex";
        });
      });

      lightbox.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % currentImages.length;
        lightboxImg.src = currentImages[currentIndex];
      });

      closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        lightbox.style.display = "none";
      });
    }
  }

  // Event listeners para filtros
  selectEstado?.addEventListener('change', aplicarFiltros);
  inputBusqueda?.addEventListener('input', aplicarFiltros);

  // Cargar productos inicialmente
  cargarTodosLosProductos();
});