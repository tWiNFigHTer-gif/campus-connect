const openBtn = document.getElementById('openDirections');
const closeBtn = document.querySelector('.back');
const panel = document.getElementById('directionsPanel');

openBtn.addEventListener('click', () => {
  panel.classList.add('open');
});

closeBtn.addEventListener('click', () => {
  panel.classList.remove('open');
});
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.getElementById('menuToggle');

        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from bubbling up
            sidebar.style.display = sidebar.style.display === 'flex' ? 'none' : 'flex';
        });

        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.style.display = 'none';
            }
        });
