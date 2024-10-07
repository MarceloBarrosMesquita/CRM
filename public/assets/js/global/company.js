var datatableCompany = false;
var $validationCompany = $('#companyForm').validate({
    rules: {
        title: {
            required: true,
            minlength: 3
        },
        color: {
            required: true,
        },
        licences_agent: {
            required: true,
            min: 1,
            minlength: 1,
            maxlength: 2
        },
        licences_supervisor: {
            required: true,
            min: 1,
            minlength: 1,
            maxlength: 2
        }
    },
    messages: {
        title: {
            required: 'Preencha o nome da empresa',
            minlength: 'Mínimo 3 dígitos'
        },
        color: {
            required: 'Selecione a cor corretamente',
        },
        licences_agent: {
            required: 'Preencha a quantidade de licença',
            min: 'Mínimo 1 licença',
            minlength: 'Mínimo 1 licença',
            maxlength: 'Máximo 99 licenças'
        },
        licences_supervisor: {
            required: 'Preencha a quantidade de licença',
            min: 'Mínimo 1 licença',
            minlength: 'Mínimo 1 licença',
            maxlength: 'Máximo 99 licenças'
        }
    },
    errorPlacement: function (error, element) {
        if ($(element).attr('name') == 'color') {
            error.insertAfter($('.sp-original-input-container'));
        } else {
            error.insertAfter(element);
        }
    },
    highlight: function (element, errorClass, validClass) {
        if ($(element).attr('name') == 'color') {
            $(element).parents('.sp-original-input-container').addClass(errorClass);
        } else {
            $(element).addClass(errorClass);
        }
    },
    unhighlight: function (element, errorClass, validClass) {
        if ($(element).attr('name') == 'color') {
            $(element).parents('.sp-original-input-container').removeClass(errorClass);
        } else {
            $(element).removeClass(errorClass).addClass(validClass);
        }
    }
});

var companyJS = {
    initBinds: function () {

        companyJS.initDatatables();
        companyJS.initSlimCrop();
        companyJS.initColorPicker();

        $('#companyForm').on('submit', function (e) {
            e.preventDefault();
            return false;
        });

        $('#companyForm .btn-persist').on('click', $.debounce(500, true, function (e) {
            e.preventDefault();
            var $valid = $('#companyForm').valid();
            if (!$valid) {
                $validationCompany.focusInvalid();
                return false;
            }

            var data = new FormData($('#companyForm')[0]);
            utilsJS.loadingDiv($('.row .card'));
            companyJS.persist(data, function (response) {
                utilsJS.loadedDiv($('.row .card'));
                utilsJS.toastNotify(response.status, response.message);
                location.href = '/companies/list';
            });
        }));
    },

    initDatatables: function () {

        if ($("#datatableCompanies")[0]) {
            datatableCompany = $("#datatableCompanies").DataTable({
                searching: true,
                paging: true,
                pageLength: 25,
                aLengthMenu: [25, 50, 100],
                iDisplayLength: 10,
                processing: true,
                serverSide: true,
                ajax: "/api/companies/datatables",
                responsive: true,
                language: {
                    emptyTable: "Não existe registro de empresas no banco de dados"
                },
                order: [
                    [0, "asc"]
                ],
                columns: [
                    {
                        mRender: function (data, type, full) {
                            if (!full['title']) {
                                return '-';
                            }
                            var tooltip = full['title'];
                            return '<div class="box-ellipsis" data-html="true" data-toggle="tooltip" data-placement="top" title="' + tooltip + '"><div class="ellipsis"><img src="/companies/image/' + full['token'] + '">' + tooltip + '</div></div>';
                        },
                        orderable: true,
                        searchable: false

                    },
                    {
                        mRender: function (data, type, full) {
                            if (!full['color']) {
                                return '-';
                            }
                            var color = utilsJS.hexToRgbA(full['color'], '0.95');
                            return '<span class="badge bg-blue-100 text-black-600 font-weight-semibold py-2 text-white" style="background: ' + color + '">' + full['color'] + '</span>';
                        },
                        orderable: false,
                        searchable: false,
                        width: '95px'
                    },
                    {
                        mRender: function (data, type, full) {
                            if (!full['licences_agent']) {
                                return '-';
                            }
                            return full['licences_agent_live'] + '/' + full['licences_agent'] + ' licença(s)';
                        },
                        orderable: false,
                        searchable: false,
                        width: '110px'
                    },
                    {
                        mRender: function (data, type, full) {
                            if (!full['licences_supervisor']) {
                                return '-';
                            }
                            return full['licences_supervisor_live'] + '/' + full['licences_supervisor'] + ' licença(s)';
                        },
                        orderable: false,
                        searchable: false,
                        width: '110px'
                    },
                    {
                        mRender: function (data, type, full) {
                            var label = false;
                            var classLabel = false;
                            if (!full['ra_company_link']) {
                                label = 'Não';
                                classLabel = 'bg-danger';
                            } else {
                                label = 'Sim';
                                classLabel = 'bg-success';
                            }

                            return '<span class="badge ' + classLabel + ' text-black-600 font-weight-semibold py-2 text-white">' + label + '</span>'
                        },
                        orderable: false,
                        searchable: false,
                        width: '115px'
                    },
                    {
                        mRender: function (data, type, full) {
                            if (!full['name_user_created']) {
                                return '-';
                            }
                            var tooltip = full['name_user_created'];
                            return '<div class="box-ellipsis" data-html="true" data-toggle="tooltip" data-placement="top" title="' + tooltip + '"><div class="ellipsis">' + tooltip + '</div></div>';
                        },
                        orderable: false,
                        searchable: false,
                        width: '180px'
                    },
                    {
                        mRender: function (data, type, full) {
                            return full['dt_created'];
                        },
                        orderable: false,
                        searchable: false,
                        width: '170px'
                    },
                    {
                        mRender: function (data, type, full) {
                            var buttonEdit = '<a href="/companies/form/' + full['token'] + '" class="me-1 btn btn-xs text-white btn-warning btn-fill"><i class="fal fa-pencil-alt"></i></a>'
                            var buttonDelete = '<button class="btn btn-xs text-white btn-danger btn-fill delete" data-token="' + full['token'] + '" data-label="' + full['title'] + '"><i class="fas fa-times"></i></button>'
                            return buttonEdit + buttonDelete;
                        },
                        orderable: false,
                        searchable: false,
                        width: '90px'
                    }
                ],
                fnRowCallback: function (nRow) {
                    $('td:eq(1)', nRow).addClass("text-center");
                    $('td:eq(4)', nRow).addClass("text-center");
                    $('td:eq(5)', nRow).addClass("text-center");
                    $('td:eq(6)', nRow).addClass("text-center");
                    $('td:eq(7)', nRow).addClass("text-center");

                },
                initComplete: function (settings, json) {
                    $('[data-toggle="tooltip"]').tooltip();
                }
            });

            datatableCompany.on('click', ' .delete', $.debounce(200, true, function (e) {
                e.preventDefault();
                var tr = $(this).closest('tr');
                var label = $(this).attr('data-label');
                var token = $(this).attr('data-token');

                utilsJS.jqueryConfirm('Tem certeza?', 'Deseja realmente excluir a empresa <b>' + label + '</b>?', function () {
                    utilsJS.loadingDiv($('.card'));

                    companyJS.delete(token, function (response) {
                        utilsJS.loadedDiv($('.card'));

                        utilsJS.toastNotify(response.status, response.message);
                        if (response.status) {
                            datatableCompany.row(tr).remove().draw();
                        }
                    });
                });
            }));
        }
    },

    initSlimCrop: function () {
        var maxFileSize = 2;

        if ($('#companyForm .slim-image')[0]) {
            $('#companyForm .slim-image').slim({
                uploadBase64: true,
                service: '/api/companies/persist-image',
                ratio: '1:1',
                minSize: {
                    width: 150,
                    height: 150,
                },
                push: true,
                maxFileSize: maxFileSize,
                download: false,
                label: 'Carregar imagem de perfil',
                statusFileSize: 'Tamanho máximo permitido: ' + maxFileSize + 'MB',
                buttonCancelLabel: 'Cancelar',
                buttonConfirmLabel: 'Confirmar',
                buttonEditLabel: 'Editar',
                buttonRemoveLabel: 'Excluir',
                statusUploadSuccess: 'Salvo!',
                meta: {
                    token: $('input[name="token"]').val()
                },

                willRemove: function (data, remove) {
                    utilsJS.jqueryConfirm('Tem certeza?', 'Tem certeza que deseja remover a imagem da empresa?', function () {
                        var token = $('input[name="token"]').val();
                        $.ajax({
                            type: 'POST',
                            url: '/api/companies/persist-image',
                            data: {
                                image: JSON.stringify({meta: {token: token}})
                            },
                            complete: function (response) {
                                try {
                                    var log = JSON.parse(response.responseText);
                                    utilsJS.toastNotify(log.status, log.message);
                                    remove();
                                } catch (e) {
                                    utilsJS.sweetMensagem(false, 'Ocorreu um erro na requisição<br /> Contate o suporte');
                                }
                            }
                        });
                    });
                },
                didUpload: function (data) {
                    var data = $('input[name="image"]').val();
                    if (data) {
                        var data = JSON.parse(data);
                        utilsJS.toastNotify(((data) ? data.status : true), ((data) ? data.message : 'Imagem de perfil atualizada com sucesso'));
                        setTimeout(function () {
                            $('input[name="image"]').val('');
                        }, 700);
                    }
                    /*if (data.data.isMyProfile) {
                        $('.img-circle.pro_pic').attr('src', '/assets/img/avatar-sombra.jpg');
                        $('.img-circle.pro_pic').attr('src', '/profile/data/image');
                    }*/
                }
            });
        }

        if ($('#companyForm .slim-image-server-side')[0]) {
            $('#companyForm  .slim-image-server-side').slim({
                ratio: '1:1',
                minSize: {
                    width: 150,
                    height: 150,
                },
                maxFileSize: maxFileSize,
                label: 'Carregar imagem de perfil',
                statusFileSize: 'Tamanho máximo permitido: ' + maxFileSize + 'MB',
                buttonCancelLabel: 'Cancelar',
                buttonConfirmLabel: 'Confirmar',
                buttonEditLabel: 'Editar',
                buttonRemoveLabel: 'Excluir',
            });
        }
    },

    initColorPicker: function () {
        if ($('#companyForm #color-picker')[0]) {
            $('#companyForm #color-picker').spectrum({
                preferredFormat: "hex",
                type: "component",
                togglePaletteOnly: "true",
                hideAfterPaletteSelect: "true",
                showInitial: "true",
                locale: "pt-br",
                cancelText: "Cancelar",
                chooseText: "Escolher",
                togglePaletteMoreText: "Mais",
                togglePaletteLessText: "Menos",
                clearText: "Limpar",
                noColorSelectedText: "NÃ£o selecionado"
            });
        }
    },

    persist: function (data, callback) {
        $.ajax({
            type: 'POST',
            url: '/api/companies/persist',
            data: data,
            contentType: false,
            processData: false,
            complete: function (response) {
                try {
                    var log = JSON.parse(response.responseText);
                    if (typeof callback == 'function') {
                        callback(log);
                    }
                } catch (e) {
                    utilsJS.sweetMensagem(false, 'Ocorreu um erro na requisição<br /> Contate o suporte');
                }
            }
        });
    },

    getCompanies: function (callback) {
        $.ajax({
            type: 'GET',
            url: '/api/companies/get',
            data: {},
            complete: function (response) {
                try {
                    var log = JSON.parse(response.responseText);
                    if (typeof callback == 'function') {
                        callback(log);
                    }
                } catch (e) {
                    utilsJS.sweetMensagem(false, 'Ocorreu um erro na requisição<br /> Contate o suporte');
                }
            }
        });
    },

    setCompanyAtSession: function (token, callback) {
        $.ajax({
            type: 'POST',
            url: '/api/companies/set-at-session',
            data: {token: token},
            complete: function (response) {
                try {
                    var log = JSON.parse(response.responseText);
                    if (typeof callback == 'function') {
                        callback(log);
                    }
                } catch (e) {
                    utilsJS.sweetMensagem(false, 'Ocorreu um erro na requisição<br /> Contate o suporte');
                }
            }
        });
    },

    delete: function (token, callback) {
        $.ajax({
            type: 'DELETE',
            url: '/api/companies/delete',
            data: {token: token},
            complete: function (response) {
                try {
                    var log = JSON.parse(response.responseText);
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
    companyJS.initBinds();
});