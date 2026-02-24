// Call the dataTables jQuery plugin  
$(document).ready(function() {
  $('#datatablesSimple').DataTable({
    "language": {
      "lengthMenu": "Exibir _MENU_ registros por página",
      "zeroRecords": "Nenhum registro encontrado",
      "info": "Mostrando página _PAGE_ de _PAGES_",
      "infoEmpty": "Nenhum registro disponível",
      "infoFiltered": "(filtrado de _MAX_ registros no total)",
      "search": "Pesquisar:",
      "paginate": {
        "first": "Primeiro",
        "last": "Último",
        "next": "Próximo",
        "previous": "Anterior"
      }
    }
  });
});
// Call the dataTables jQuery plugin
