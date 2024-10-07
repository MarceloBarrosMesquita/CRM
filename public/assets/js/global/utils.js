// noinspection JSIgnoredPromiseFromCall

var utilsJS = {

    uuidv4: function () {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    },

    //Aplica animacao em um determinado elemento
    applyAnimate: function (element, effect, infinite) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        element.addClass(((infinite) ? 'infinite ' : '') + ' animated ' + effect).one(animationEnd, function () {
            $(this).removeClass('animated ' + effect);
        });
    },

    //Inicia animacao de loading com mensagem
    loading: function (message) {
        var loader = "<div class='showbox'><div class='loader'><svg class='circular' viewBox='25 25 50 50'><circle class='path' cx='50' cy='50' r='20' fill='none' stroke-width='2' stroke-miterlimit='10'/></svg></div>";
        $('.fancybox-overlay').remove();
        $('#fancybox-loading-spinner').remove();
        $('body').append('<div class="fancybox-overlay fancybox-overlay-fixed" style="display: none;">' + '</div><div id="fancybox-loading-spinner" style="display: none;"><div><span>' + ((message) ? message : '') + '</span></div>' + loader + '</div></div>');
        $('.fancybox-overlay, #fancybox-loading-spinner').fadeIn('fast');
    },

    //Finaliza animacao de loading
    loaded: function () {
        $('.fancybox-overlay, #fancybox-loading-spinner, .fancybox-wrap').fadeOut(function () {
            $('.fancybox-overlay, #fancybox-loading-spinner, .fancybox-wrap').remove();
        });
    },

    //Inicia animacao de loading dentro de um elemento especifico
    loadingDiv: function (element) {
        utilsJS.loaded();
        element.css('position', 'relative');
        element.append('<div class="loader-specific"><div class="loader-specific-back"><svg class="circular-specific" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></circle></svg></div></div>');
        return true;
    },

    //Finaliza animacao de loading dentro de um elemento especifico
    loadedDiv: function (element = null) {
        if (element) {
            if ($(element).hasClass('status-dropdown')) {
                $(element).css('position', 'relative');
            } else {
                $(element).css('position', 'static');
            }
        }
        $(element).find('.loader-specific').remove();
    },

    autoResizeIframe: function () {
        $.each($('.collapse.show iframe'), function (k, v) {
            var target = $(v).contents().find('html');

            $(target).css('display', 'grid');
            var height = $(target).outerHeight(true);

            /*if (height == 50) {
                height = 400;
            }*/

            $(v).height(height);

            if ($(v).contents().find('body').width() > 800) {
                $(v).attr('scrolling', 'yes');
            }
        });
    },

    //Inicia animacao de loading dentro de um elemento especifico
    loadingElement: function (element) {
        element.removeClass('loading-input');
        element.addClass('loading-input');
    },

    //Finaliza animacao de loading dentro de um elemento especifico
    loadedElement: function (element = null) {
        element.removeClass('loading-input');
    },

    toastNotify: function (status, message, delay = null, positionClass = null) {
        var type = (status) ? 'success' : 'error';
        var title = (status) ? 'Gepros' : 'Erro!';
        var _message = (status) ? ('😉 ' + message) : ('😢 ' + message);
        var options = {
            closeButton: true,
            timeOut: (delay) ? delay : 3000,
            extendedTimeOut: (delay) ? delay : 3000,
            tapToDismiss: false,
            progressBar: true,
            positionClass: (positionClass) ? positionClass : "toast-top-right",
            preventDuplicates: true,
            showMethod: "fadeIn",
            showDuration: 200,
            showEasing: "swing",
            hideMethod: "fadeOut",
            hideDuration: 200,
            hideEasing: "swing"
        };

        eval('toastr.' + type + '(_message,title, options)');
    },

    //Inicia SweetMensagem
    sweetMensagem: function (status, message, redirect, formReset, callback) {
        sweetAlert({
            html: true,
            type: (status) ? 'success' : 'error',
            title: (status) ? 'Sucesso!' : 'Ops!',
            text: message,
            confirmButtonColor: (status) ? '#84cc5c' : '#d25454',
            confirmButtonText: (status) ? 'Ok!' : 'Fechar!',
            closeOnConfirm: true
        }, function () {
            if (typeof callback == 'function') {
                callback();
            }
            if (formReset) {
                document.getElementById(formReset).reset();
            }
            if (redirect) {
                location.href = redirect;
            }
        });
    },

    //Inicia SweetConfirm
    sweetMensagemConfirm: function (title, text, callbackTrue, callbackFalse, confirmButtonText, cancelButtonText) {
        sweetAlert({
            title: title,
            text: text,
            html: true,
            showCancelButton: true,
            confirmButtonColor: "#5cb85c",
            confirmButtonText: (confirmButtonText) ? confirmButtonText : 'Sim',
            cancelButtonText: (cancelButtonText) ? cancelButtonText : 'Cancelar',
            showLoaderOnConfirm: false,
            closeOnConfirm: true,
            allowOutsideClick: false
        }, function (isConfirm) {
            if (isConfirm) {
                if (typeof callbackTrue == 'function') {
                    callbackTrue();
                }
            } else {
                if (typeof callbackFalse == 'function') {
                    callbackFalse();
                }
            }
        });
    },

    //Inicia Jquery Confirm
    jqueryConfirm: function (title, text, callbackTrue, callbackFalse, confirmButtonText, cancelButtonText, callbackOnAction, closeIcon) {
        $.confirm({
            theme: "supervan",
            title: title,
            content: text,
            animation: 'scale',
            closeAnimation: 'zoom',
            animationSpeed: 400,
            animateFromElement: false,
            typeAnimated: false,
            opacity: 1,
            bgOpacity: .80,
            backgroundDismiss: false,
            useBootstrap: true,
            scrollToPreviousElement: false,
            scrollToPreviousElementAnimate: false,
            closeIcon: (closeIcon) ? closeIcon : false,
            draggable: false,
            buttons: {
                'confirm': {
                    text: (confirmButtonText) ? confirmButtonText : 'Tenho certeza!',
                    btnClass: 'btn btn-lg btn-success btn-border btn-fill ',
                    action: function () {
                        if (typeof callbackTrue == 'function') {
                            callbackTrue();
                            return true;
                        }
                        return true;
                    }
                },
                'cancel': {
                    text: (cancelButtonText) ? cancelButtonText : 'Cancelar',
                    btnClass: 'btn btn-lg btn-danger btn-border btn-fill',
                    action: function (e) {
                        if (typeof callbackFalse == 'function') {
                            callbackFalse();
                        }
                    }
                },
                /*moreButtons: {
                    text: 'something else',
                    action: function () {
                        $.alert('you clicked on <strong>something else</strong>');
                    }
                },*/
            },
            onAction: function (btnName) {
                // when a button is clicked, with the button name
                if (typeof callbackOnAction == 'function') {
                    callbackOnAction(btnName);
                    return true;
                }
            },
            onOpen: function () {
                $('body').addClass('bg-blur');
            },
            onOpenBefore: function () {
                $('body').addClass('bg-blur');
            },
            onClose: function () {
                $('body').removeClass('bg-blur');
            },
            onDestroy: function () {
                $('body').removeClass('bg-blur');
            },
        });
    },

    //Inicia Jquery Info
    jqueryInfo: function (title, text, callbackTrue, callbackFalse, confirmButtonText, cancelButtonText, callbackOnAction, closeIcon) {
        $.confirm({
            theme: "supervan",
            title: title,
            content: text,
            animation: 'scale',
            closeAnimation: 'zoom',
            animationSpeed: 400,
            animateFromElement: false,
            typeAnimated: false,
            opacity: 1,
            bgOpacity: .80,
            backgroundDismiss: false,
            useBootstrap: true,
            scrollToPreviousElement: false,
            scrollToPreviousElementAnimate: false,
            closeIcon: (closeIcon) ? closeIcon : false,
            draggable: false,
            buttons: {
                'confirm': {
                    text: (confirmButtonText) ? confirmButtonText : 'OK!',
                    btnClass: 'btn btn-lg btn-success btn-border btn-fill ',
                    action: function () {
                        if (typeof callbackTrue == 'function') {
                            callbackTrue();
                            return true;
                        }
                        return true;
                    }
                }
            },
            onAction: function (btnName) {
                // when a button is clicked, with the button name
                if (typeof callbackOnAction == 'function') {
                    callbackOnAction(btnName);
                    return true;
                }
            },
            onOpen: function () {
                $('body').addClass('bg-blur');
            },
            onOpenBefore: function () {
                $('body').addClass('bg-blur');
            },
            onClose: function () {
                $('body').removeClass('bg-blur');
            },
            onDestroy: function () {
                $('body').removeClass('bg-blur');
            },
        });
    },

    //Inicia Simple Text
    sweetMensagemSimpleText: function (title, text) {
        sweetAlert({
            title: title,
            text: text,
            html: true,
            confirmButtonColor: "#84cc5c",
            confirmButtonText: 'Ok!'
        });
    },

    //Inicia Sweet com elemento HTML
    sweetHTML: function (title, text, withButton, callbackTrue) {
        sweetAlert({
            title: title,
            text: text,
            html: true,
            showConfirmButton: (withButton) ? true : false,
            confirmButtonColor: "#84cc5c",
            confirmButtonText: 'Ok!',
            allowOutsideClick: true
        }, function () {
            if (typeof callbackTrue == 'function') {
                callbackTrue();
            }
        });
    },

    //Retorna parametros da url
    getUrlParameter: function (sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    },

    //Primeira letra maiuscula
    ucfirst: function (str, force) {
        str = force ? str.toLowerCase() : str;
        return str.replace(/(\b)([a-zA-Z])/,
            function (firstLetter) {
                return firstLetter.toUpperCase();
            });
    },

    //Formata frase para titulo
    titleize: function (text) {
        console.log(typeof text);
        var words = text.toLowerCase().split(" ");
        for (var a = 0; a < words.length; a++) {
            var w = words[a];
            words[a] = w[0].toUpperCase() + w.slice(1);
        }
        return words.join(" ");
    },

    //Mascara personalizada
    mask: function (val, mask) {
        val += '';
        var maskared = '';
        var k = 0;
        for (var i = 0; i <= (mask.length - 1); i++) {
            if (mask.charAt(i) == '#') {
                if (val.charAt(k) != '') {
                    maskared += val.charAt(k++);
                }
            } else {
                if (mask.charAt(i) != '') {
                    maskared += mask.charAt(i);
                }
            }
        }
        return maskared;
    },

    //Inicia lib editable
    initEditable: function () {
        if ($('.editable-select')[0]) {
            $.fn.editable.defaults.mode = 'inline';
            $.fn.editable.defaults.ajaxOptions = {type: "PUT"};
            var value = false;
            $('.editable-select').editable({
                showbuttons: false,
                sourceCache: false,
                sourceError: "Erro ao carregar lista",
                source: function () {
                    value = $(this).attr('data-value-selected');
                    var result = false;
                    $.ajax({
                        type: 'POST',
                        url: '/api/quick-edit/select',
                        global: false,
                        async: false,
                        data: {resource: $(this).attr('data-resource')},
                        dataType: 'json',
                        complete: function (response) {
                            var log = JSON.parse(response.responseText);
                            result = log.data;
                        }
                    });
                    return result;
                },
                url: '/api/quick-edit/text',
                highlight: '#ffca93',
                params: {
                    table: 'table',
                    column: 'column',
                    pk_name: 0
                }
            });
        }

        if ($('.editable')[0]) {
            $.fn.editable.defaults.mode = 'inline';
            $.fn.editable.defaults.ajaxOptions = {type: "PUT"};

            $('.editable').editable({
                validate: function (value) {
                    if ($(this).attr('data-required') == 'true') {
                        if ($.trim(value) == '') {
                            return 'Campo Obrigatório';
                        }
                    }
                },
                url: '/api/quick-edit/text',
                type: $(this).attr('data-type'),
                name: $(this).attr('data-column'),
                pk: $(this).attr('data-pk'),
                title: $(this).attr('data-title'),
                highlight: '#c2e9ff',
                params: {table: 'table', column: 'column', pk_name: 0}
            }).on('shown', function (e, editable) {
                editable.options.params.table = $(this).attr('data-table');
                editable.options.params.column = $(this).attr('data-column');
                editable.options.params.pk_name = $(this).attr('data-pk-name');
            });
        }
    },

    //Sanitize textos
    sanitize: function (input) {
        var output = input.replace(/<script[^>]*?>.*?<\/script>/gi, '').replace(/<((?!br))[\/\!]*?[^<>]*?>/gi, '').replace(/<style[^>]*?>.*?<\/style>/gi, '').replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
        return output;
    },

    sanitizeFilename: function (string) {
        const a = 'àáäâãèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
        const b = 'aaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
        const p = new RegExp(a.split('').join('|'), 'g')
        return string.toString().toLowerCase().trim()
            .replace(p, c => b.charAt(a.indexOf(c))) // Replace special chars
            .replace(/&/g, '-and-') // Replace & with 'and'
            .replace(/[\s\W-]+/g, '-') // Replace spaces, non-word characters and dashes with a single dash (-)
    },

    initNativeNotifications: function () {

        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        }

        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            //new Notification("Hi there!");
        }

        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== 'denied' || Notification.permission === "default") {
            Notification.requestPermission(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    new Notification("As notificações foram ativadas");
                }
            });
        }

        // Otherwise, browser notification was blocked by user
        else {
            console.log("Browser notification was blocked by user");
        }
    },

    //Send native browser notifications
    nativeNotification: function (title, body) {
        let options = {
            body: body,
            icon: '/assets/img/logo/square.png',
        };

        let n = new Notification(title, options);
        setTimeout(n.close.bind(n), 5000);
    },

    //Init Mascaras
    initMaks: function () {
        $('.mask-date-hour').mask('00/00/0000 00:00', {reverse: true});
        $('.mask-cpf').mask('000.000.000-00');
        $('.mask-cnpj').mask('00.000.000/0000-00', {reverse: true});
        $('.mask-date').mask('00/00/0000', {reverse: true});
        $('.mask-hour').mask('00:00', {reverse: true});
        $('.mask-hour-seconds').mask('00:00', {reverse: true});
        $('.mask-cep').mask('00000-000');
        $('.mask-card').mask('0000.0000.0000.0000', {reverse: true});
        $('.mask-card-date').mask('00/0000', {reverse: true});
        $('.mask-numbers').mask('0000000000', {reverse: true});
        $('.mask-numbers-2').mask('00', {reverse: true});
        $('.mask-numbers-3').mask('000', {reverse: true});
        var maskPattern = function (val) {
            return val.replace(/\D/g, '').length === 11 ? '(00) 00000-0000' : '(00) 0000-00009';
        }, spOptions = {
            onKeyPress: function (val, e, field, options) {
                field.mask(maskPattern.apply({}, arguments), options);
            }
        };
        $('.mask-phone').mask(maskPattern, spOptions);
        var maskPatternCpfCnpj = function (val) {
                return val.replace(/\D/g, '').length <= 11 ? '000.000.000-009' : '00.000.000/0000-00';
            },
            cpfCnpjpOptions = {
                onKeyPress: function (val, e, field, options) {
                    field.mask(maskPatternCpfCnpj.apply({}, arguments), options);
                }
            };
        $('.mask-cpf-cnpj').mask(maskPattern, cpfCnpjpOptions);
    },

    //Init Fancybox
    initFancybox: function () {
        if ($("[data-fancybox-custom]")[0]) {
            $("[data-fancybox-custom]").fancybox({
                closeExisting: false,
                arrows: true,
                infobar: true,
                smallBtn: "auto",
                buttons: [
                    "zoom",
                    "slideShow",
                    "fullScreen",
                    "download",
                    "thumbs",
                    "close"
                ],
                idleTime: 3,
                animationEffect: "zoom",
                animationDuration: 366,
                zoomOpacity: "auto",
                transitionEffect: "fade",
                transitionDuration: 366
            });
        }
    },

    //Init Tooltip
    initTooltip: function () {
        $('[data-toggle="tooltip"]').tooltip();
    },

    //Init Tooltip
    initSlimScroll: function () {
        var $slimScrolls = $('.slimscroll');

        // Sidebar Slimscroll
        if ($slimScrolls.length > 0) {
            $slimScrolls.slimScroll({
                height: 'auto',
                width: '100%',
                position: 'right',
                size: '5px',
                color: '#ccc',
                wheelStep: 10,
                touchScrollStep: 100
            });

            var wHeight = $(window).height();
            $slimScrolls.height(wHeight);
            $('.left-sidebar .slimScrollDiv, .sidebar-menu .slimScrollDiv, .sidebar-menu .slimScrollDiv').height(wHeight);
            $('.right-sidebar .slimScrollDiv').height(wHeight - 30);
            $('.chat .slimScrollDiv').height(wHeight - 70);
            $('.chat.settings-main .slimScrollDiv').height(wHeight);
            $('.right-sidebar.video-right-sidebar .slimScrollDiv').height(wHeight - 90);
            $(window).resize(function () {
                var rHeight = $(window).height();
                $slimScrolls.height(rHeight);
                $('.left-sidebar .slimScrollDiv, .sidebar-menu .slimScrollDiv, .sidebar-menu .slimScrollDiv').height(rHeight);
                $('.right-sidebar .slimScrollDiv').height(wHeight - 30);
                $('.chat .slimScrollDiv').height(rHeight - 70);
                $('.chat.settings-main .slimScrollDiv').height(wHeight);
                $('.right-sidebar.video-right-sidebar .slimScrollDiv').height(wHeight - 90);
            });
        }

    },

    //Init CKEDITOR
    initCKEDITOR: function () {
        if ($('#editor')[0]) {
            initSample();
            CKEDITOR.on('instanceReady', function () {
                var aux = CKEDITOR.instances.editor.getData();
                CKEDITOR.instances.editor.setData(aux);
            });
        }
    },

    //Init Star CountUP
    initStartTimer: function (init, interval, element = null) {
        var now = moment();
        var duration = moment.duration(now.diff(init))._data;

        var sla = false;

        if (duration.days == 0) {
            if (duration.hours == 0) {
                sla = (duration.minutes) + ' minuto(s)';
            } else {
                sla = (duration.hours) + ' horas(s) ' + ' e ' + (duration.minutes) + '  minuto(s)';
            }
        } else {
            if (duration.months != 0) {
                sla = (((duration.months) * 30) + (duration.days)) + ' dia(s) e ' + (duration.hours) + ' hora(s)';
            } else {
                sla = (duration.days) + ' dia(s) e ' + (duration.hours) + ' hora(s)';
            }
        }

        if (element) {
            $('.box-ocorrencia-info .tempo-atendimento span').html(sla);
        }

        setTimeout(function () {
            utilsJS.initStartTimer(init, interval);
        }, (interval * 1000));
    },

    //Init Progress Bar
    initProgressBar: function (element, duration, callback) {
        $(element).html('');
        var bar = new ProgressBar.Line(element.toString(), {
            strokeWidth: 1,
            easing: 'linear', //easeOut - linear - easeOut
            duration: duration,
            color: '#4daf7c',
            trailColor: '#bfbfbf    ',
            trailWidth: 1,
            svgStyle: {width: '100%', height: '100%'}
        });

        bar.animate(1.0, duration, function () {
            if (typeof callback == 'function') {
                callback(bar);
            }
        });
    },

    //Animate functoin control from JS
    animateCss: function (animationName, callback) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function () {
            var obj = $(this);
            obj.removeClass('animated ' + animationName);
            if (callback && typeof callback === 'function') callback(obj);
        });
    },

    //Animate functoin control from JS
    populateSelect: function (element, data, indexName, indexValue, customData) {
        var aux = '<option value="">-- Selecione --</option>';
        $.each(data, function (k, v) {
            var custom = (customData) ? ('data-cpf-required="' + v["CPF_REQUIRED"] + '"') : '';
            aux += '<option name="' + v[indexName] + '" value="' + v[indexValue] + '" ' + custom + ' >' + v[indexName] + '</option>'
        });
        $(element).html(aux);
    },

    validaCPF: function (strCPF) {
        var Soma;
        var Resto;
        Soma = 0;
        strCPF = strCPF.toString();

        while (strCPF.length < 11) {
            strCPF = '0' + strCPF;
        }
        if (strCPF == "00000000000") return false;

        for (i = 1; i <= 9; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
        Resto = (Soma * 10) % 11;

        if ((Resto == 10) || (Resto == 11)) Resto = 0;
        if (Resto != parseInt(strCPF.substring(9, 10))) return false;

        Soma = 0;
        for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
        Resto = (Soma * 10) % 11;

        if ((Resto == 10) || (Resto == 11)) Resto = 0;
        if (Resto != parseInt(strCPF.substring(10, 11))) return false;
        return true;
    },

    soNumeros: function (string) {
        var numsStr = string.replace(/[^0-9]/g, '');
        return parseInt(numsStr);
    },

    titleize: function (text) {
        var words = text.toLowerCase().split(" ");
        for (var a = 0; a < words.length; a++) {
            if (words[a]) {
                var w = words[a];
                words[a] = w[0].toUpperCase() + w.slice(1);
            }
        }
        return words.join(" ");
    },

    applyDelayDatatablesSearch: function (callback) {
        if ($('.dataTables_wrapper')[0]) {
            $('.dataTables_filter input[type="search"]').unbind();
            $('.dataTables_filter input[type="search"]').keyup(utilsJS.delay(function (e) {
                var elementDatatables = $(this);
                $(elementDatatables).parents('.dataTables_wrapper').find('table').DataTable().search($(this).val()).draw();
                if (typeof callback == 'function') {
                    callback();
                }
            }, 800));
        }
    },

    delay: function (callback, ms) {
        var timer = 0;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                callback.apply(context, args);
            }, ms || 0);
        };
    },

    getURI: function (position) {
        var real_uri = window.location.pathname;
        var uri = real_uri.split('/');
        var shift = uri.shift();
        return (uri[position]) ? uri[position] : false;
    },

    getQueryParams: function (index = null) {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }

        if (index) {
            if (!vars[index]) {
                return false;
            }
            return vars[index];
        }

        return vars;
    },

    hexToRgbA: function (hex, opacity) {
        opacity = (opacity) ? opacity : 1;
        var c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + opacity + ')';
        }
        throw new Error('Bad Hex');
    },

    dateFormatFriendly: function (date) {

        var now = moment();
        var duration = moment.duration(date.diff(now));


        var label = '';
        var days = (duration._data.days < 0) ? ((duration._data.days) * -1) : duration._data.days;
        if (days == 0) {
            if (date.format('DD/MM') == now.format('DD/MM')) {
                label = 'Hoje';
            } else {
                label = 'Ontem';
            }
        } else if (days == 1) {
            label = 'Ontem';
        } else if (days > 1 && days < 7) {
            label = utilsJS.titleize(date._locale._weekdaysShort[date._d.getDay()]);
        } else {
            label = date.format('DD/MM');
        }

        var label = label + ', ' + date.format('HH:mm');
        return label;

    }
};


