/* BUSCADOR */
document
  .getElementById("searchInput")
  .addEventListener("input", e => {
    searchQuery = e.target.value;
    filterJobs();
  });

/* CATEGORIA */
document
  .getElementById("categoryFilters")
  .addEventListener("click", e => {

    if (e.target.tagName === "BUTTON") {
      selectedCategory = e.target.dataset.category;
      filterJobs();
    }
  });
                                         /* renderJobs(jobs); */ 
/* UBICACION */
document
  .getElementById("locationFilter")
  .addEventListener("change", e => {
    selectedLocation = e.target.value;
    filterJobs();
  });


const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
});
const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add(
                "bg-slate-900",
                "shadow-lg",            
                "backdrop-blur-md"
            );
        } else {
            navbar.classList.remove(
                "bg-slate-900",
                "shadow-lg",
                "backdrop-blur-md"
            );
        }
    });
/*LO QUE ESTA PASANDO AQUI!!

Escuchamos el evento scroll

Si baja más de 50px → activamos estilo sólido

Si vuelve arriba → quitamos estiloLo que está pasando aquí

Escuchamos el evento scroll

Si baja más de 50px → activamos estilo sólido

Si vuelve arriba → quitamos estilo*/ 

 /*
===============================================
SISTEMA DE CARRUSEL AUTOMÁTICO (AUTO-SLIDE)
===============================================
Lógica:
1. Seleccionamos todos los slides.
2. Seleccionamos los indicadores.
3. Guardamos el índice actual.
4. Cada 5 segundos cambiamos al siguiente slide.
5. Actualizamos clases de opacidad.
*/
const slides = document.querySelectorAll(".slide");
const indicators = document.querySelectorAll(".indicator");

let currentIndex = 0;
const intervalTime = 5000; // 5 segundos
function showSlide(index) {
        /*
        Recorremos todos los slides:
        - Quitamos opacidad activa
        - Activamos solo el slide correspondiente
        */
        slides.forEach((slide, i) => {
            slide.classList.remove("opacity-100");
            slide.classList.add("opacity-0");
            indicators[i].classList.remove("opacity-100");
            indicators[i].classList.add("opacity-50");
        });

        slides[index].classList.remove("opacity-0");
        slides[index].classList.add("opacity-100");

        indicators[index].classList.remove("opacity-50");
        indicators[index].classList.add("opacity-100");
    }
    function nextSlide() {
        currentIndex++;
    if (currentIndex >= slides.length) {
         currentIndex = 0;
    }

    showSlide(currentIndex);
}



// Ejecuta cambio automático cada X segundos
setInterval(nextSlide, intervalTime);


/*
let selectedCategory = "all";
let selectedLocation = "all";
let searchQuery = "";

function renderJobs(filteredJobs) {
  const container = document.getElementById("jobsContainer");
  container.innerHTML = "";

  filteredJobs.forEach(job => {
    container.innerHTML += `
      <article class="bg-white p-6 rounded-xl shadow-md mb-4">
        <h3 class="text-xl font-semibold">${job.title}</h3>
        <p class="text-gray-600">${job.company}</p>
        <div class="flex gap-2 mt-2 text-sm">
          <span class="bg-blue-100 px-3 py-1 rounded-full">${job.type}</span>
          <span class="bg-green-100 px-3 py-1 rounded-full">${job.location}</span>
        </div>
      </article>
    `;
  });
}

*/

function filterJobs() {
  const filtered = jobs.filter(job => {

    const matchesCategory =
      selectedCategory === "all" ||
      job.category === selectedCategory;

    const matchesLocation =
      selectedLocation === "all" ||
      job.location === selectedLocation;

    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesLocation && matchesSearch;
  });

  renderJobs(filtered);
}
