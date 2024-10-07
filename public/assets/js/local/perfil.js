// noinspection SpellCheckingInspection
let datatablePerfil = false;
let validationPerfil = $('#perfilForm').validate({
    rules: {
        descricao: {
            required: true,
            minlength: 3
        }
    },
    messages: {
        descricao: {
            required: 'Preencha o nome do perfil',
            minlength: 'Mínimo 3 dígitos'
        }
    }
});

let perfilJS = {
    initBinds: function () {
        perfilJS.initDatatables();

        //bind persist form
        $('.btn-persist').on('click', function (e) {
         
            e.preventDefault();
            let valid = $('#perfilForm').valid();
            if (!valid) {
                validationPerfil.focusInvalid();
                return false;
            }
            let data = new FormData($('#perfilForm')[0]);
            
            perfilJS.persist(data, function (response) {
                utilsJS.loadedDiv($('.row .card'));
                utilsJS.toastNotify(response.status, response.message);
                if (response.status) {
                    setTimeout(function () {
                        
                        location.reload();
                        location.href = '/cpainel/perfil/list';
                        
                    }, 300);
                }
            });
        });


    },

    initDatatables: function () {
        // noinspection JSJQueryEfficiency
        if ($("#datatablePerfil")[0]) {
            datatablePerfil = $("#datatablePerfil").DataTable({
                searching: true,
                paging: true,
                pageLength: 25,
                aLengthMenu: [25, 50, 100],
                iDisplayLength: 10,
                processing: true,
                serverSide: true,
                ajax: "/api/perfil/datatables",
                responsive: true,
                language: {
                    processing: "Processando...",
                    search: "Buscar:",
                    lengthMenu: "Exibir _MENU_ registros",
                    info: "Exibindo _START_ a _END_ de _TOTAL_ registros",
                    infoEmpty: "Exibindo 0 a 0 de 0 registros",
                    infoFiltered: "(filtrado de _MAX_ registros no total)",
                    infoPostFix: "",
                    loadingRecords: "Carregando...",
                    zeroRecords: "Nenhum registro encontrado",
                    emptyTable: "Não existe registro de perfis no banco de dados",
                    paginate: {
                        first: "Primeiro",
                        previous: "Anterior",
                        next: "Próximo",
                        last: "Último"
                    },
                    aria: {
                        sortAscending: ": ativar para ordenar a coluna de forma crescente",
                        sortDescending: ": ativar para ordenar a coluna de forma decrescente"
                    }
                },
                order: [
                    [0, "asc"]
                ],
                columns: [
                    {
                        data: 'id', // Mapeando a coluna 'id'
                        mRender: function (data, type, full) {
                            let tooltip = full['id'];
                            return '<div class="box-ellipsis" data-html="true" data-toggle="tooltip" data-placement="top" title="' + tooltip + '"><div class="ellipsis">' + tooltip + '</div></div>';
                        },
                        orderable: false,
                        searchable: false,
                        width: '240px'
                    },
                    {
                        data: 'descricao', // Mapeando a coluna 'descricao'
                        mRender: function (data, type, full) {
                            let tooltip = full['descricao'];
                            return '<div class="box-ellipsis" data-html="true" data-toggle="tooltip" data-placement="top" title="' + tooltip + '"><div class="ellipsis">' + tooltip + '</div></div>';
                        },
                        orderable: false,
                        searchable: false,
                        width: '240px'
                    },
                    {
                        data: 'dt_created', // Mapeando a coluna 'dt_created'
                        mRender: function (data, type, full) {
                            return full['dt_created'];
                        },
                        orderable: false,
                        searchable: false,
                        width: '170px'
                    },
                    {
                        data: null, // Não vinculada a nenhum campo de dados
                        mRender: function (data, type, full) {
                            let buttonEdit = '<a href="/cpainel/perfil/form/' + full['id'] + '" class="me-1 btn btn-xs text-white btn-warning btn-fill"><i class="fal fa-pencil-alt"></i></a>';
                            let buttonDelete = '<button class="btn btn-xs text-white btn-danger btn-fill delete" data-id-perfil="' + full['id'] + '" data-label="' + full['descricao'] + '"><i class="fas fa-times"></i></button>';
                            return buttonEdit + buttonDelete;
                        },
                        orderable: false,
                        searchable: false,
                        width: '90px'
                    }
                ],
                fnRowCallback: function (nRow) {
                    $('td:eq(2)', nRow).addClass("text-center");
                    $('td:eq(3)', nRow).addClass("text-center");
                },
                initComplete: function (settings, json) {
                    $('[data-toggle="tooltip"]').tooltip();
                }
            });
        
            datatablePerfil.on('click', '.delete',function (e) {
                e.preventDefault();
                let tr = $(this).closest('tr');
                let label = $(this).attr('data-label');
                let token = $(this).attr('data-id-perfil');
        
                utilsJS.jqueryConfirm('Tem certeza?', 'Deseja realmente excluir o usuário <b>' + label + '</b>?', function () {
                    utilsJS.loadingDiv($('.card'));
        
                    perfilJS.delete(token, function (response) {
                        utilsJS.loadedDiv($('.card'));
        
                        utilsJS.toastNotify(response.status, response.message);
                        if (response.status) {
                            datatablePerfil.row(tr).remove().draw();
                        }
                    });
                });
            });
        }        
    },

    persist: function (data, callback) {
        $.ajax({
            type: 'POST',
            url: '/api/perfil/persist',
            data: data,
            contentType: false,
            processData: false,
            complete: function (response) {
                try {
                    let log = JSON.parse(response.responseText);
                    if (typeof callback == 'function') {
                        callback(log);
                    }
                } catch (e) {
                    utilsJS.sweetMensagem(false, 'Ocorreu um erro na requisição<br /> Contate o suporte');
                }
            }
        });
    },

    delete: function (id_perfil, callback) {
        $.ajax({
            type: 'DELETE',
            url: '/api/perfil/delete',
            data: {id_perfil: id_perfil},
            complete: function (response) {
                try {
                    let log = JSON.parse(response.responseText);
                    if (typeof callback == 'function') {
                        callback(log);
                    }
                } catch (e) {
                    utilsJS.sweetMensagem(false, 'Ocorreu um erro na requisição<br /> Contate o suporte');
                }
            }
        });
    }
}

$(document).ready(function () {
    perfilJS.initBinds();
});