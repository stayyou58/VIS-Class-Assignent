document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('.navbtn');
    const alert = document.querySelector('.alert');
    const toast = document.querySelector('.toast');
    const btnClose = document.querySelector('.close');
    
    btn.addEventListener('click', () => {
      // Show an alert message
      alert.style.display = 'block';
      alert.style.animation = 'fadein 0.5s, fadeout 0.5s 2.5s';
    });

    btnClose.addEventListener('click', () => {
      // Hide an alert message
      alert.style.display = 'none';
    })

  });
  