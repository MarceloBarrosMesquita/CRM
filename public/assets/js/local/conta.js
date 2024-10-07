// noinspection SpellCheckingInspection
let datatableConta = false;
let validationConta = $('#contaForm').validate({
    rules: {
        fl_tipo_conta: {
            required: true,
        },
        fl_tipo_pessoa: {
            required: true,
        },
        cpf_cnpj: {
            required: true,
        },
        razao_social: {
            required: true,
        },
        identificacao_conta: {
            required: true,
        },
        cep: {
            required: true,
        },
        endereco: {
            required: true,
        },
        bairro: {
            required: true,
        },
        cidade: {
            required: true,
        },
        estado: {
            required: true,
        },
        numero: {
            required: true,
        },
        telefone: {
            required: true,
        },
        id_plano: {
            required: true,
        },
        valor_setup: {
            required: true,
        },
        parcelas_setup: {
            required: true,
        },
        dia_fatuamento: {
            required: true,
            max: 31 
        },
        email: {
            required: true,
            email: true // Validação de email
        },
        data_inicio_sistema: {
            required: true,
        },
    },
    messages: {
        fl_tipo_conta: {
            required: 'Selecione Tipo de conta',
        },
        fl_tipo_pessoa: {
            required: 'Selecione Tipo de Pessoa',
        },
        cpf_cnpj: {
            required: "Informe CPF/CNPJ",
        },
        razao_social: {
            required: "Informe Razão Social",
        },
        identificacao_conta: {
            required: "Informe identificação conta",
        },
        cep: {
            required: "Informe CEP",
        },
        endereco: {
            required: "Informe Endereco",
        },
        bairro: {
            required: "Informe Bairro",
        },
        cidade: {
            required: "Informe Cidade",
        },
        estado: {
            required: "Informe Estado",
        },
        numero: {
            required: "Informe Número",
        },
        telefone: {
            required: "Informe telefone",
        },
        id_plano: {
            required: "Informe o plano",
        },
        valor_setup: {
            required: "Informe o Valor",
        },
        parcelas_setup: {
            required: "Informe as Parcelas",
        },
        dia_fatuamento: {
            required: "Informe o dia de faturamento",
            max: "O valor deve ser menor ou igual a 31."
        },
        email: {
            required: "Informe a data início",
            email: "Por favor, insira um endereço de email válido" 
        },
        data_inicio_sistema: {
            required: "Informe a data início",
        },
    }
});

let contaJS = {
    initBinds: function () {
        utilsJS.initMaks();
        contaJS.initMultiselect();
        contaJS.initDatatables();

        //bind persist form
        $('.btn-persist').on('click', function (e) {
         
            e.preventDefault();
            let valid = $('#contaForm').valid();
            if (!valid) {
                validationConta.focusInvalid();
                return false;
            }
            let data = new FormData($('#contaForm')[0]);
            
            contaJS.persist(data, function (response) {
                utilsJS.loadedDiv($('.row .card'));
                utilsJS.toastNotify(response.status, response.message);
                if (response.status) {
                    setTimeout(function () {
                        
                        location.reload();
                        location.href = '/cpainel/conta/list';
                        
                    }, 300);
                }
            });
        });

        $('input[name="cep"]').on('blur', function (e) {
            e.preventDefault();
            let cep = $(this).val().replace(/\D/g, '');
            if (cep.length !== 8) {
                utilsJS.toastNotify(false, 'Preencha o CEP corretamente');
                return false;
            }

            $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {

                    if (!("erro" in dados)) {
                        //Atualiza os campos com os valores da consulta.
                        $("#endereco").val(dados.logradouro);
                        $("#bairro").val(dados.bairro);
                        $("#cidade").val(dados.localidade);
                        $("#estado").val(dados.uf);
                        //$("#ibge").val(dados.ibge);
                    } 
                    else {
                        //CEP pesquisado não foi encontrado.
                        limpa_formulário_cep();
        
                        utilsJS.toastNotify(false, 'CEP não encontrado');
                    }
                });
                setTimeout(function () {
                    $('input[name="numero"]').focus();
                }, 300);
            
        });
        $('input[name="cpf_cnpj"]').on('blur', function (e) {
            e.preventDefault();
            let cpf_cnpj = $(this).val().replace(/\D/g, '');

            if ($("#fl_tipo_pessoa").val() == 1) {
                var length = 14;
                var label = "CNPJ";
            } else {
                var length = 11;
                var label = "CPF";
            }
            if (cpf_cnpj.length !== length) {
                utilsJS.toastNotify(false, 'Preencha o '+label+' corretamente');
                return false;
            }
            validarCnpj(cpf_cnpj);
            
        });

        $('input[name="valor_setup"]').keypress(function(){
            mascara(this,moeda);
        });   
    


    },
    initMultiselect: function () {
        $('select.multiselect').multiselect({
            nonSelectedText: 'Selecione...',
            nSelectedText: 'selecionado',
            allSelectedText: 'Todos selecionados',
            resetText: 'Resetar',
            enableCaseInsensitiveFiltering: true,
            enableFiltering: true,
            filterPlaceholder: 'Buscar...',
            includeSelectAllOption: true,
            selectAllText: ' Selecionar todos',
            buttonWidth: '100%',
            optionlabel: 'pussy-fuck',
            enableHtml: true,
            onChange: function (element, checked) {
                let elementParent = $(element).parents('select');
                if ($(elementParent).attr('id') === 'fl_tipo_pessoa') {
                  
                    var fl_tipo_pessoa = $(elementParent).val(); // Obtém o valor do select

                    if (fl_tipo_pessoa == 1) {
                        $('#cpf_cnpj').mask('00.000.000/0000-00'); // Máscara para CNPJ
                        $('#cpf_cnpj').attr('placeholder', 'Digite o CNPJ'); // Atualiza o placeholder
                    } else {
                        $('#cpf_cnpj').mask('000.000.000-00'); // Máscara para CPF
                        $('#cpf_cnpj').attr('placeholder', 'Digite o CPF'); // Atualiza o placeholder
                    }


                }
            },
            onSelectAll: function () {

            },
            onDeselectAll: function () {

            }
        });

    },

    initDatatables: function () {
        // noinspection JSJQueryEfficiency
        if ($("#datatableConta")[0]) {
            datatableConta = $("#datatableConta").DataTable({
                searching: true,
                paging: true,
                pageLength: 25,
                aLengthMenu: [25, 50, 100],
                iDisplayLength: 10,
                processing: true,
                serverSide: true,
                ajax: "/api/conta/datatables",
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
                        data: 'razao_social', // Mapeando a coluna 'descricao'
                        mRender: function (data, type, full) {
                            let tooltip = full['fl_tipo_conta'];
                            return '<div class="box-ellipsis" data-html="true" data-toggle="tooltip" data-placement="top" title="' + tooltip + '"><div class="ellipsis">' + tooltip + '</div></div>';
                        },
                        orderable: false,
                        searchable: false,
                        width: '240px'
                    },
                    {
                        data: 'razao_social', // Mapeando a coluna 'descricao'
                        mRender: function (data, type, full) {
                            let tooltip = full['razao_social'];
                            return '<div class="box-ellipsis" data-html="true" data-toggle="tooltip" data-placement="top" title="' + tooltip + '"><div class="ellipsis">' + tooltip + '</div></div>';
                        },
                        orderable: false,
                        searchable: false,
                        width: '240px'
                    },
                    {
                        data: 'data_inicio_sistema', // Mapeando a coluna 'descricao'
                        mRender: function (data, type, full) {
                            let tooltip = full['data_inicio_sistema'];
                            return '<div class="box-ellipsis" data-html="true" data-toggle="tooltip" data-placement="top" title="' + tooltip + '"><div class="ellipsis">' + tooltip + '</div></div>';
                        },
                        orderable: false,
                        searchable: false,
                        width: '240px'
                    },
                    {
                        data: 'dia_faturamento', // Mapeando a coluna 'descricao'
                        mRender: function (data, type, full) {
                            let tooltip = full['dia_faturamento'];
                            return '<div class="box-ellipsis" data-html="true" data-toggle="tooltip" data-placement="top" title="' + tooltip + '"><div class="ellipsis">' + tooltip + '</div></div>';
                        },
                        orderable: false,
                        searchable: false,
                        width: '240px'
                    },
                    {
                        data: null, // Mapeando a coluna 'dt_created'
                        mRender: function (data, type, full) {
                            if(!full['data_cancelamento']){
                                return "-";
                            }
                            return full['data_cancelamento'];
                        },
                        orderable: false,
                        searchable: false,
                        width: '170px'
                    },
                    {
                        data: null, // Não vinculada a nenhum campo de dados
                        mRender: function (data, type, full) {
                            let buttonEdit = '<a href="/cpainel/conta/form/' + full['id'] + '" class="me-1 btn btn-xs text-white btn-warning btn-fill"><i class="fal fa-pencil-alt"></i></a>';
                            let buttonDelete = '<button class="btn btn-xs text-white btn-danger btn-fill delete" data-id-conta="' + full['id'] + '" data-label="' + full['descricao'] + '"><i class="fas fa-times"></i></button>';
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
        
            datatableConta.on('click', '.delete',function (e) {
                e.preventDefault();
                let tr = $(this).closest('tr');
                let label = $(this).attr('data-label');
                let token = $(this).attr('data-id-conta');
        
                utilsJS.jqueryConfirm('Tem certeza?', 'Deseja realmente excluir o usuário <b>' + label + '</b>?', function () {
                    utilsJS.loadingDiv($('.card'));
        
                    contaJS.delete(token, function (response) {
                        utilsJS.loadedDiv($('.card'));
        
                        utilsJS.toastNotify(response.status, response.message);
                        if (response.status) {
                            datatableConta.row(tr).remove().draw();
                        }
                    });
                });
            });
        }        
    },

    persist: function (data, callback) {
        $.ajax({
            type: 'POST',
            url: '/api/conta/persist',
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

    delete: function (id_conta, callback) {
        $.ajax({
            type: 'DELETE',
            url: '/api/conta/delete',
            data: {id_conta: id_conta},
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
}

$(document).ready(function () {
    contaJS.initBinds();
});