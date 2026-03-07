const exampleModal = document.getElementById('exampleModal')
exampleModal.addEventListener('show.bs.modal', event => {
    document.getElementById("inputEmail").innerText = "";
    document.getElementById("inputPassword").innerText = "";
    
    const button = event.relatedTarget
    // Extract info from data-bs-* attributes
    const recipient = button.getAttribute('data-bs-whatever')

    const modalTitle = exampleModal.querySelector('.modal-title')
    // const modalBodyInput = exampleModal.querySelector('.modal-body input')

    localStorage.setItem("tipoLogin", recipient);

    modalTitle.textContent = `Entrar como ${recipient}`
    // modalBodyInput.value = recipient
})



const modalRegistrar = document.getElementById('modalRegistrar')
modalRegistrar.addEventListener('show.bs.modal', event => {

  const modalTitle = modalRegistrar.querySelector('.modal-title')
  const modalBodyInput = modalRegistrar.querySelector('.modal-body input')

  modalTitle.textContent = `Cadastro de ${localStorage.getItem("tipoLogin")}`
//   modalBodyInput.value = recipient
})
