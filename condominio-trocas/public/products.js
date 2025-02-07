const initializeCarousel = () => {
  document.querySelectorAll('.carousel').forEach(carousel => {
    const imagesContainer = carousel.querySelector('.carousel-images');
    const images = imagesContainer.querySelectorAll('img');
    const leftButton = carousel.querySelector('.carousel-btn.left');
    const rightButton = carousel.querySelector('.carousel-btn.right');
    let currentIndex = 0;

    // Função para atualizar o carrossel e gerenciar botões
    function updateCarousel() {
      imagesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
      leftButton.style.display = currentIndex === 0 ? 'none' : 'flex';
      rightButton.style.display = currentIndex === images.length - 1 ? 'none' : 'flex';
    }

    // Exibir botões apenas ao passar o mouse sobre o carrossel
    carousel.addEventListener('mouseenter', () => {
      leftButton.style.opacity = '1';
      rightButton.style.opacity = '1';
    });

    carousel.addEventListener('mouseleave', () => {
      leftButton.style.opacity = '0';
      rightButton.style.opacity = '0';
    });

    leftButton.addEventListener('click', (event) => {
      event.stopPropagation();
      currentIndex = Math.max(0, currentIndex - 1);
      updateCarousel();
    });

    rightButton.addEventListener('click', (event) => {
      event.stopPropagation();
      currentIndex = Math.min(images.length - 1, currentIndex + 1);
      updateCarousel();
    });

    updateCarousel();
  });
};
