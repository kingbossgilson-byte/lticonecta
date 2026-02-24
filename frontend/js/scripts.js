window.addEventListener('DOMContentLoaded', event => {

    function showModal(contentHTML) {
        const container = document.createElement('div');
        container.classList.add('modal', 'fade');
        container.tabIndex = -1;
        container.innerHTML = `${contentHTML}`;
    
        // Adicionar o container da modal ao body
        document.body.appendChild(container);
    
        // Inicializar e mostrar a modal
        const modal = new bootstrap.Modal(container);
        modal.show();
    
        // Opcional: Remover a modal do DOM após o fechamento
        container.addEventListener('hidden.bs.modal', function () {
            container.remove();
        });
    }
    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }

document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    let email = document.getElementById("inputEmail").value;
    let password = document.getElementById("inputPassword").value;
    let accountType = document.getElementById("accountType").value;

    try {
        let response = await fetch("http://gilson-1.tailb6453c.ts.net:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email: email, 
                password: password,
                accountType: accountType
            }),
        });

        let data = await response.json();

        if (response.ok) {

            // 🔐 Salva token
            localStorage.setItem("token", data.token);
            localStorage.setItem("usuarioId", data.user.id);
            localStorage.setItem("usuarioNome", data.user.name);
            localStorage.setItem("usuariSummary", data.user.summary);
            localStorage.setItem("usuarioEnterprise", data.user.enterprise);
            localStorage.setItem("usuarioTipo", data.user.accountType);
            localStorage.setItem("usuarioIsAdministrator", data.user.isAdministrator?.data?.[0]);
            localStorage.setItem("usuarioDescricao", data.user.designation);
            localStorage.setItem("usuarioScore", data.user.score);
            localStorage.setItem("usuarioFoto", data.user.profilePic);
            localStorage.setItem("usuarioEmail", data.user.email);


            const content = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Login</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-success text-center">
                                Login realizado com sucesso, bem-vindo ${data.user.name}!
                            </div>
                        </div>
                    </div>
                </div>
            `;
            showModal(content);

            setTimeout(function () {
                if (data.user.accountType === "Cliente") {
                    window.location.href = "index.html";
                } else {
                    window.location.href = "profissional.html";
                }
            }, 1500);

        } else {

            const content = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Erro</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-danger text-center">
                                ${data.error}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            showModal(content);
        }

    } catch (error) {
        console.error(error);
        alert("Erro ao conectar ao servidor.");
    }
});

});
