// noinspection JSUnresolvedFunction,DuplicatedCode,JSJQueryEfficiency
// noinspection SpellCheckingInspection
let validationUser = $('#userForm').validate({
    rules: {
        nome: {
            required: true,
            minlength: 3
        },
        login: {
            required: true,
            minlength: 3
        },
        email: {
            required: {
                depends: function () {
                    return (parseInt($('select[name="id_perfil"]').val()));
                }
            },
            email: {
                depends: function () {
                    return (parseInt($('select[name="id_perfil"]').val()));
                }
            }
        },
        cpf: {
            required: true,
        },
        telefone: {
            required: true,
        },
        password: {
            required: true,
        },
        password_confirm: {
            required: true,
            equalTo: '#password'
        },
        id_perfil: {
            required: true
        },
       

    },
    messages: {
        fullname: {
            required: 'Preencha o nome completo',
            minlength: 'Mínimo 3 dígitos'
        },
        login: {
            required: 'Preencha o login',
            minlength: 'Mínimo 4 dígitos'
        },
        email: {
            required: 'Preencha um e-mail válido',
            email: 'Preencha um e-mail válido',
        },
        password: {
            required: 'Preencha sua senha',
        },
        cpf: {
            required: 'Preencha seu cpf',
        },
        telefone: {
            required: 'Preencha seu telefone',
        },
        password_confirm: {
            required: 'Preencha sua senha',
            equalTo: 'As senha não coincidem'
        },
        id_perfil: {
            required: 'Selecione o perfil do usuário'
        },
        
    },
    errorPlacement: function (error, element) {
        if ($(element).attr('name') === 'id_queue[]') {
            error.insertAfter($('.box-queues'));
        } else {
            error.insertAfter(element);
        }
    }
});

let usuarioJS = {

    initBinds: function () {

        utilsJS.initMaks();
        usuarioJS.initDatatables();

        //Action on click enter [authForm]
        $('#userForm').on('keypress', function (event) {
            let keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode === '13') {
                if ($('#userForm')[0]) {
                    $('.btn-persist').click();
                    return true;
                }
            }
        });

        //bind persist form
        $('.btn-persist').on('click', function (e) {
            e.preventDefault();
            let $valid = $('#userForm').valid();
            if (!$valid) {
                validationUser.focusInvalid();
                return false;
            }

            $('.btn-persist').attr('disabled', 'disabled');
            let data = new FormData($('#userForm')[0]);
            utilsJS.loadingDiv($('.row .card'));
            usuarioJS.persist(data, function (response) {
                $('.btn-persist').removeAttr('disabled');
                utilsJS.loadedDiv($('.row .card'));
                utilsJS.toastNotify(response.status, response.message);
                if (response.status) {
                    setTimeout(function () {
                        location.href = '/usuario/list';
                    }, 300);
                }
            });
        });




        //bind check password role
        $('input[name="password"]').on('keyup', function () {
            let value = $(this).val();
            oauthJS.checkPassword(value);
        });

    },

    initDatatables: function () {
        // noinspection JSJQueryEfficiency
        if ($("#datatableUsuario")[0]) {
            // noinspection SpellCheckingInspection
            datatableUsuario = $("#datatableUsuario").DataTable({
                searching: true,
                paging: true,
                pageLength: 25,
                aLengthMenu: [25, 50, 100],
                iDisplayLength: 10,
                processing: true,
                serverSide: true,
                ajax: {
                    'url': '/api/usuario/datatables',
                    'type': 'GET',
                },
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
                           
                            return full['id'];
                            
                        },
                        orderable: true,
                        searchable: false,
                        width: '220px'
                    },
                    {
                        data: 'nome', // Mapeando a coluna 'id'
                        mRender: function (data, type, full) {
                            return full['nome'];
                        },
                        orderable: false,
                        searchable: false,
                        width: '175px'
                    },
                    {
                        data: 'login', // Mapeando a coluna 'id'
                        mRender: function (data, type, full) {
                            if (!full['login']) {
                                return '-';
                            }
                            let tooltip = full['login'];
                            return '<div class="box-ellipsis" data-html="true" data-toggle="tooltip" data-placement="top" title="' + tooltip + '"><div class="ellipsis">' + tooltip + '</div></div>';
                        },
                        orderable: false,
                        searchable: false,
                    },
                    {
                        data: 'perfil', // Mapeando a coluna 'id'
                        mRender: function (data, type, full) {
                            if (!full['perfil']) {
                                return '-';
                            }
                            let tooltip = full['perfil'];
                            return '<div class="box-ellipsis" data-html="true" data-toggle="tooltip" data-placement="top" title="' + tooltip + '"><div class="ellipsis">' + tooltip + '</div></div>';
                        },
                        orderable: false,
                        searchable: false,
                        width: '135px'
                    },
                    {
                        data: null, // Mapeando a coluna 'id'
                        mRender: function (data, type, full) {
                            let buttonEdit = '<a href="/usuario/form/' + full['id'] + '" class="me-1 btn btn-xs text-white btn-warning btn-fill" data-html="true" data-toggle="tooltip" data-placement="top" title="Editar usuário"><i class="fal fa-pencil-alt"></i></a>';
                            let buttonDelete = '<button class="btn btn-xs text-white btn-danger btn-fill delete" data-id="' + full['id'] + '" data-label="' + full['nome'] + '" data-html="true" data-toggle="tooltip" data-placement="top" title="Inatilet usuário"><i class="fas fa-times"></i></button>';
                            

                            return buttonEdit + buttonDelete;

                        },
                        orderable: false,
                        searchable: false,
                        width: '120px'
                    }
                ],
                fnRowCallback: function (nRow, full) {
                    if (full.dt_blocked_wrong_password) {
                        $(nRow).addClass("user-blocked");
                    }

                    if (parseInt(full.fl_is_deleted) === 1) {
                        $(nRow).addClass("user-inactive");
                    }

                    $('td:eq(2)', nRow).addClass("text-center");
                    $('td:eq(4)', nRow).addClass("text-center");
                },
                initComplete: function () {
                    $('[data-toggle="tooltip"]').tooltip();
                }
            });

            datatableUsuario.on('click', '.delete',function (e) {
                e.preventDefault();
                let tr = $(this).closest('tr');
                let label = $(this).attr('data-label');
                let id = $(this).attr('data-id');
                utilsJS.jqueryConfirm('Tem certeza?', 'Deseja realmente inatilet o usuário <b>' + label + '</b>?', function () {
                    utilsJS.loadingDiv($('.card'));
                    usuarioJS.delete(id, function (response) {
                        utilsJS.loadedDiv($('.card'));
                        utilsJS.toastNotify(response.status, response.message);
                        if (response.status) {
                            datatableUsuario.row(tr).remove().draw();
                        }
                    });
                });
            });

          
        }
    },

    

    persist: function (data, callback) {
        let resource = '/api/usuario/persist';
        $.ajax({
            type: 'POST',
            url: resource,
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
                    utilsJS.sweetMensagem(false, 'Ocorreu um erro ao tentar salvar o usuário. Por favor, tente novamente mais tarde ou entre em contato com o suporte técnico para obter assistência.');
                }
            }
        });
    },

    delete: function (id, callback) {
        $.ajax({
            type: 'DELETE',
            url: '/api/usuario/delete',
            data: {id: id},
            complete: function (response) {
                try {
                    let log = JSON.parse(response.responseText);
                    if (typeof callback == 'function') {
                        callback(log);
                    }
                } catch (e) {
                    utilsJS.sweetMensagem(false, 'Ocorreu um erro ao excluir usuário.<br />Caso persista, contate o suporte.');
                }
            }
        });
    },
}

$(document).ready(function () {
    usuarioJS.initBinds();
});