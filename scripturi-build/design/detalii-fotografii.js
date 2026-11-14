(() => {
  const dialog = document.getElementById('photo-detail');
  const title = document.getElementById('photo-detail-title');
  const text = dialog.querySelector('.photo-detail-text');
  document.addEventListener('click', event => {
    const point = event.target.closest('.photo-point');
    if (point) {
      title.textContent = point.dataset.title;
      text.textContent = point.dataset.detail;
      dialog.showModal();
    } else if (event.target === dialog) {
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right ||
          event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    }
  });
})();
