const gallery = document.getElementById("gallery");
const loadTrigger = document.getElementById("load-trigger");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeLightbox = document.getElementById("close-lightbox");

let page = 1;
let isLoading = false;

async function fetchPhotos() {
  if (isLoading) return;
  isLoading = true;
  loadTrigger.textContent = "Đang tải thêm...";

  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/photos?_page=${page}&_limit=20`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const photos = await response.json();
    renderPhotos(photos);
    page += 1;
    loadTrigger.textContent = "Cuộn xuống để tải thêm...";
  } catch (error) {
    loadTrigger.textContent = `Lỗi: ${error.message}`;
  } finally {
    isLoading = false;
  }
}

function renderPhotos(photos) {
  const html = photos
    .map(
      photo => `
      <div class="card">
        <img src="${photo.thumbnailUrl}" alt="${photo.title}" loading="lazy" data-large="${photo.url}" />
      </div>`
    )
    .join("");
  gallery.insertAdjacentHTML("beforeend", html);
}

gallery.addEventListener("click", event => {
  const img = event.target.closest("img[data-large]");
  if (!img) return;
  lightboxImg.src = img.dataset.large;
  lightbox.classList.remove("hidden");
});

closeLightbox.addEventListener("click", () => {
  lightbox.classList.add("hidden");
  lightboxImg.src = "";
});

lightbox.addEventListener("click", event => {
  if (event.target === lightbox) {
    lightbox.classList.add("hidden");
    lightboxImg.src = "";
  }
});

const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    fetchPhotos();
  }
}, { rootMargin: "200px" });

observer.observe(loadTrigger);
fetchPhotos();
