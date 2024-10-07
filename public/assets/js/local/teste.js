// noinspection JSUnresolvedFunction,JSUnresolvedVariable,JSJQueryEfficiency,SpellCheckingInspection,DuplicatedCode
// noinspection JSJQueryEfficiency
let datatableOccurrences = false;
let componentDateRangePicker = false;
let validationOccurrenceForm = $('#occurrenceForm').validate({
    rules: {
        id_tabulation_1: {
            required: true
        },
        id_brand: {
            required: true
        },
        id_store: {
            required: true
        },
        id_channel: {
            required: true
        },
        id_queue: {
            required: true
        },
        id_status: {
            required: true
        },
        observations: {
            required: true
        },
    },
    messages: {
        id_tabulation_1: {
            required: "Selecione tabulação"
        },
        id_brand: {
            required: "Selecione Marca"
        },
        id_store: {
            required: "Selecione Loja"
        },
        id_channel: {
            required: "Selecione Canal de atendimento"
        },
        id_queue: {
            required: "Selecione Fila"
        },
        id_status: {
            required: "Selecione Status da Ocorrência"
        },
        observations: {
            required: "Informe a observação da ocorrência"
        },
    },
    errorPlacement: function (error, element) {

        error.insertAfter(element); // Coloca o erro logo após o campo

    },
    highlight: function (element, errorClass) {

        $(element).addClass(errorClass); // Aplica o erro diretamente no campo normal

    },
    unhighlight: function (element, errorClass) {
        if ($(element).hasClass('trumbowyg-editor')) {
            $(element).closest('.trumbowyg-box').removeClass(errorClass);
            $(element).parents('.form-group').find('label.error').remove();
        } else {
            $(element).removeClass(errorClass);
        }
    },
});

let occurrenceJS = {
    initBinds: function () {
        //occurrenceJS.initDatatables();
        occurrenceJS.initMultiselect();
        occurrenceJS.initDateRangePicker();

        //prevent submit form
        $('#occurrenceForm').on('submit', function (e) {
            e.preventDefault();
            return false;
        });

        $('#occurrenceForm').on('click', '.btn-persist', $.debounce(400, true, function (e) {

            let $valid = $('#occurrenceForm').valid();
            if (!$valid) {
                validationOccurrenceForm.focusInvalid();
                return false;
            }
            let data = new FormData($('#occurrenceForm')[0]);


            utilsJS.jqueryConfirm('Tem certeza?', 'Deseja salvar dados da ocorrência?', function () {
                utilsJS.loadingDiv($('.row .card'));
                occurrenceJS.persist(data, function (response) {
                    utilsJS.loadedDiv($('.row .card'));
                    utilsJS.toastNotify(response.status, response.message);
                    if (response.status) {
                        setTimeout(function () {
                            location.href = '/occurrences/list';
                        }, 300);
                    }
                });
            }, function () {
                return false;
            }, 'OK', 'Cancelar');

        }));

        $('body').delegate('.btn-filter-occurrences', 'click', $.debounce(1000, true, function (e) {
            e.preventDefault();
            datatableOccurrences.ajax.reload();
        }));
    },

    initDateRangePicker: function () {

        if ($('input[name="filter_date"]')[0]) {
            let start = false;
            let end = false;

            // noinspection DuplicatedCode
            componentDateRangePicker = $('input[name="filter_date"]').daterangepicker({
                autoUpdateInput: (start),
                autoApply: false,
                timePicker24Hour: false,
                singleDatePicker: false,
                timePickerIncrement: false,
                timePicker: false,
                showDropdowns: true,
                opens: 'right',
                drops: 'auto',
                linkedCalendars: true,
                minDate: moment().subtract(6, 'month'),
                maxDate: moment().add(1, 'days'),
                alwaysShowCalendars: false,
                applyButtonClasses: 'btn-success',
                cancelButtonClasses: 'btn-danger',
                startDate: (start) ? start : false,
                endDate: (end) ? end : false,
                locale: {
                    format: "DD/MM/YYYY",
                    cancelLabel: 'Limpar',
                    applyLabel: 'Selecionar',
                    customRangeLabel: 'Data Personalizada',
                },
                ranges: {
                    'Hoje': [moment(), moment()],
                    'Ontem': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Últimos 7 dias': [moment().subtract(6, 'days'), moment()],
                    'Últimos 15 dias': [moment().subtract(14, 'days'), moment()],
                    'Últimos 30 dias': [moment().subtract(30, 'days'), moment()],
                    'Últimos 60 dias': [moment().subtract(60, 'days'), moment()]
                }
            });

            //Event clear date on click button
            $('span.filter_date').on('click', function () {
                $('input[name="filter_date"]').trigger('cancel.daterangepicker');
            });

            //Event clear date
            componentDateRangePicker.on('cancel.daterangepicker', function (ev, picker) {
                $(this).val('');
                $('#filter').removeClass('btn-outline-primary').addClass('btn-primary');
            });

            //Event apply date
            componentDateRangePicker.on('apply.daterangepicker', function (ev, picker) {
                $('.btn-filter-occurrences').removeClass('btn-outline-primary').addClass('btn-primary');
                $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
            });
        }

        if ($('.btn-filter-occurrences')[0]) {
            $('.btn-filter-occurrences').on('click', $.debounce(200, true, function (e) {
                e.preventDefault();
                $('.btn-filter-occurrences').removeClass('btn-primary animated pulse infinite').addClass('btn-outline-primary');
            }));
        }
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
                if ($(elementParent).attr('id') === 'id_brand') {

                    let id_brand = $(element).val();
                    let elementFilled = $('#occurrenceForm select[name="id_store"]');
                    utilsJS.loadingDiv($(elementFilled).parents('.multiselect-native-select').find('.btn-group'));
                    storesJS.getByIdBrand(id_brand, function (response) {
                        utilsJS.loadedDiv($(elementFilled).parents('.multiselect-native-select').find('.btn-group'));

                        $(elementFilled).html('');
                        $(elementFilled).attr('disabled', false);
                        $(elementFilled).append($('<optgroup />').attr('label', 'Lojas').attr('id', 1).get(0).outerHTML);
                        $(elementFilled).find('optgroup').html($('<option />').attr('value', '').html('Selecione').get(0).outerHTML);
                        if (!response.status) {
                            utilsJS.toastNotify(response.status, response.message);
                            $(elementFilled).attr('disabled', true);
                            $(elementFilled).find('optgroup').append($('<option>', {
                                value: '',
                                html: 'Selecione'
                            }));
                            return false;
                        }
                        $.each(response.data, function (index, value) {
                            $(elementFilled).find('optgroup').append($('<option>', {
                                value: value.id_store,
                                html: value.title
                            }));
                        });
                        $(elementFilled).multiselect('rebuild');
                    });

                }
            },
            onSelectAll: function () {

            },
            onDeselectAll: function () {

            }
        });

        $('.multiselect-native-select').each(function (key, value) {
            if ($(value).find('select[readonly]')[0]) {
                $(value).find('button').addClass('readonly');
            } else {
                $(value).find('button').removeClass('readonly');
            }
        });
    },

    initDatatables: function () {

        if (!$('#datatableOccurrences')[0]) {
            return false;
        }

        // noinspection JSJQueryEfficiency
        let resource = 'datatables'
        if (utilsJS.getURI(1) === 'history') {
            resource = 'datatables-history'
        } else if (utilsJS.getURI(1) === 'view-all') {
            resource = 'datatables-all'
        }

        datatableOccurrences = $('.occurrences #datatableOccurrences').DataTable({
            processing: true,
            searching: true,
            paging: true,
            lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "Todos"]],
            pageLength: 20,
            responsive: true,
            ordering: true,
            order: [
                [0, "desc"]
            ],
            serverSide: true,
            ajax: {
                type: 'GET',
                contentType: 'application/json',
                url: '/api/occurrences/' + resource,
                data: function (d) {
                    d.id_brand = $("#id_brand").val();
                    d.id_queue = $("#id_queue").val();
                    d.id_status = $("#id_status").val();
                    d.id_channel = $("#id_channel").val();
                    d.date = $("#filter_date").val();
                }
            },
            columns: [
                {
                    mRender: function (data, type, full) {
                        if (!full['protocol']) {
                            return '-';
                        }
                        let tooltip = full['protocol'];
                        return '<div class="box-ellipsis" data-html="true" data-toggle="tooltip" data-placement="top" title="' + tooltip + '"><div class="ellipsis">' + tooltip + '</div></div>';
                    },
                    orderable: true,
                    searchable: false,
                    width: '100px'
                },
                {
                    mRender: function (data, type, full) {
                        if (!full['title_queue']) {
                            return '-';
                        }

                        let tooltip = full['title_queue'];
                        let color = full['color_queue'];
                        let bgcolor = utilsJS.hexToRgbA(full['color_queue'], '0.20');
                        return '<div class="box-ellipsis" data-html="true" data-toggle="tooltip" data-placement="top" title="' + tooltip + '"><div class="ellipsis"><div class="badge d-block p-1" style="background: ' + bgcolor + '; color:' + color + ';">' + tooltip + '</div></div></div>';
                    },
                    orderable: true,
                    searchable: false,
                },
                {
                    mRender: function (data, type, full) {
                        if (!full['title_status']) {
                            return '-';
                        }

                        let tooltip = full['title_status'];
                        let color = full['color_queue'];
                        let bgcolor = utilsJS.hexToRgbA(full['color_queue'], '0.20');
                        return '<div class="box-ellipsis" data-html="true" data-toggle="tooltip" data-placement="top" title="' + tooltip + '"><div class="ellipsis"><div class="badge d-block p-1" style="background: ' + bgcolor + '; color:' + color + ';">' + tooltip + '</div></div></div>';
                    },
                    orderable: true,
                    searchable: false,
                    width: '100px'
                },
                {
                    mRender: function (data, type, full) {
                        if (!full['tabulation']) {
                            return '-';
                        }
                        let tooltip = full['tabulation'];
                        return '<div class="box-ellipsis" data-html="true" data-toggle="tooltip" data-placement="top" title="' + tooltip + '"><div class="ellipsis">' + tooltip + '</div></div>';
                    },
                    orderable: false,
                    searchable: false,
                    width: '100px'
                },
                {
                    mRender: function (data, type, full) {
                        if (!full['title_channel']) {
                            return '-';
                        }
                        let tooltip = full['title_channel'];
                        return '<div class="box-ellipsis" data-html="true" data-toggle="tooltip" data-placement="top" title="' + tooltip + '"><div class="ellipsis">' + tooltip + '</div></div>';
                    },
                    orderable: true,
                    searchable: false,
                    width: '150px'
                },
                {
                    mRender: function (data, type, full) {
                        if (!full['title_store']) {
                            return '-';
                        }
                        let tooltip = full['title_store'];
                        return '<div class="box-ellipsis" data-html="true" data-toggle="tooltip" data-placement="top" title="' + tooltip + '"><div class="ellipsis">' + tooltip + '</div></div>';
                    },
                    orderable: false,
                    searchable: false,
                    width: '100px'
                },

                {
                    mRender: function (data, type, full) {
                        let date = moment(full['dt_created'], 'DD-MM-YYYY hh:mm:ss');
                        return date.format('DD/MM/YY HH:mm');
                    },
                    orderable: true,
                    searchable: false,
                    width: '110px'
                },
                {
                    mRender: function (data, type, full) {
                        return '<a href="/occurrences/form/' + full['id_occurrence'] + '" class="me-1 btn btn-xs text-white btn-primary btn-fill">+ Detalhes</a>';
                    },
                    orderable: false,
                    searchable: false,
                    width: '80px'
                }
            ],
            fnRowCallback: function (nRow) {
                $('td:eq(1)', nRow).addClass("text-center");
                $('td:eq(6)', nRow).addClass("text-center");
                $('td:eq(7)', nRow).addClass("text-center");
                $('td:eq(2)', nRow).css('min-width', '180px');
            },
            initComplete: function () {
                $('[data-toggle="tooltip"]').tooltip();
            }
        });

        datatableOccurrences.on('click', '.delete', $.debounce(200, true, function (e) {
            e.preventDefault();
            let tr = $(this).closest('tr');
            let label = $(this).attr('data-label');
            let token = $(this).attr('data-id-occurrence');

            utilsJS.jqueryConfirm('Tem certeza?', 'Deseja realmente excluir a ocorrência <b>' + label + '</b>?', function () {
                utilsJS.loadingDiv($('.card'));

                occurrenceJS.delete(token, function (response) {
                    utilsJS.loadedDiv($('.card'));

                    utilsJS.toastNotify(response.status, response.message);
                    if (response.status) {
                        datatableOccurrences.row(tr).remove().draw();
                    }
                });
            });
        }));
    },

    persist: function (data, callback) {
        $.ajax({
            type: 'POST',
            url: '/api/occurrences/persist',
            data: data,
            processData: false,
            contentType: false,
            complete: function (response) {
                try {
                    let log = JSON.parse(response.responseText);
                    if (typeof callback == 'function') {
                        callback(log);
                    }
                } catch (e) {
                    utilsJS.sweetMensagem(false, 'Ocorreu um erro ao salvar ocorrência.<br />Caso persista, contate o suporte.');
                }
            }
        });
    },

    getByIdRef: function (id_tabulation, callback) {
        $.ajax({
            type: 'GET',
            url: '/api/tabulations/get-by-id-ref',
            data: {id: id_tabulation},
            datatype: 'json',
            timeout: 35000,
            complete: function (response) {
                try {
                    var log = JSON.parse(response.responseText);
                    if (typeof callback == 'function') {
                        callback(log);
                    }
                } catch (e) {
                    callback(log);
                    utilsJS.toastNotify(false, "Ocorreu um erro ao buscar tabulações relacionadas.<br />Caso persista, contate o suporte.");
                }
            }
        });
    },

};

$(document).ready(function () {
    occurrenceJS.initBinds();
});