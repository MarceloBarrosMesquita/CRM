// noinspection JSUnresolvedFunction,JSStringConcatenationToES6Template

let breakJS = {
    initBinds: function () {
        $('.btn-logout').on('click', $.debounce(1000, true, function (e) {
            utilsJS.jqueryConfirm('Sair?', 'Deseja sair do sistema?', function () {
                $.ajax({
                    type: 'POST',
                    url: '/api/auth/logout',
                    data: {},
                    complete: function (response) {
                        try {
                            let log = JSON.parse(response.responseText);
                            if(log.status == true){
                                location.reload();
                            }
                        } catch (e) {
                            utilsJS.sweetMensagem(false, 'Ocorreu um erro na requisição<br /> Contate o suporte');
                        }
                    }
                });
            }, function () {
            }, 'Tenho certeza', 'Cancelar');
            return false;
        }));
    },
}
