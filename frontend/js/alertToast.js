window.toastNaTela = function (mensagem, tipo, icone, cor) {

    const container = document.getElementById("perfilToast");

    const toastElement = document.createElement("div");
    toastElement.className = `toast align-items-center text-bg-${tipo} m-2 border-0`;
    toastElement.setAttribute("role", "alert");
    toastElement.setAttribute("aria-live", "assertive");
    toastElement.setAttribute("aria-atomic", "true");

    toastElement.innerHTML = `
        <div>
            <div class="d-flex">
                <div class="toast-body p-3">
                <i class="bi bi-${icone} p-2" style="color: ${cor}; font-size: 1rem;"></i>
                 ${mensagem}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>        
    `;

    container.appendChild(toastElement);

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}
