// noinspection JSUnresolvedVariable,JSUnresolvedFunction,JSCheckFunctionSignatures,SpellCheckingInspection

let curuchatIframeParentComponent = null;

let key = false;
let tempSentMessages = [];
let requestCheckMessages = false;
let curuchatSettings = {
    'data': {},
    'state': {
        'isConnected': false,
        'isCheckingStatus': false,
        'isCheckingNewMessages': false,
        'isFullFinished': false
    }
};

let chatWidget = {

    initBinds: function () {
        console.log('[webchat] initBinds');

        key = utilsJS.getRouteParameter(4);

        //bind button start conversation
        $('body').delegate('button.curuchat-chat-start', 'click', $.debounce(1000, true, function (e) {
            e.preventDefault();
            chatWidget.connectTask(function () {
                console.log('[curuchat] webchat connected!');
            });
        }));

        //set actions on clicking enter
        $('textarea[id="msg-textarea"]').on('keydown', function (event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13' && !event.shiftKey) {
                event.preventDefault();
                switch (true) {
                    case $('textarea[id="msg-textarea"]').is(":focus"):
                        $('#curuchat-send-message').click();
                        event.stopPropagation();
                        return true;
                        break;
                    default:
                        event.stopPropagation();
                        return true;
                }
            }
        });

        //Send message
        $('#curuchat-send-message').on('click', function (e) {
            e.preventDefault();
            if ($('textarea[id="msg-textarea"]').val() == '') {
                return false;
            }

            let curuchatSettings = chatWidget.getCuruchatData();
            if (curuchatSettings.state.isFullFinished == true) {
                chatWidget.resetChat(function () {
                    chatWidget.connectTask(function () {
                        chatWidget.sendMessage($('textarea[id="msg-textarea"]').val());
                        return true;
                    });
                });
            } else {
                let curuchatSettings = chatWidget.getCuruchatData();
                curuchatSettings.state.isCheckingNewMessages = true;
                curuchatSettings.state.isCheckingStatus = true;
                curuchatSettings.state.isConnected = true;
                curuchatSettings.state.isFullFinished = false;
                chatWidget.setCuruchatData(curuchatSettings);

                chatWidget.sendMessage($('textarea[id="msg-textarea"]').val());
            }
        });

        //bind on click interactive button
        $('body').delegate('ul.curuchat-interactive-buttons li', 'click', $.debounce(500, true, function (e) {
            e.preventDefault()
            let label = $.trim($(this).find('div').html());
            if (!label) {
                throw new Error('invalid button label');
                return false;
            }

            $(this).attr('disabled', 'disabled');
            $('#message-input textarea').val(label);
            setTimeout(function () {
                $('#curuchat-send-message').click();
            }, 100);
        }));

        //bind send attachment
        $('body').delegate('input[type="file"]', 'change', $.debounce(10, true, function (e) {
            e.preventDefault();
            if (!$('input[name="uploadFile"]')[0].files[0]) {
                throw new Error('inconsistent attachment');
                return false;
            }

            let metadata = $('input[name="uploadFile"]')[0].files[0];
            let size = metadata.size / 1000;
            let filename = metadata.name;
            let extensionAux = metadata.name.split('.');
            let extension = extensionAux[extensionAux.length - 1].toLowerCase();

            if (size > config.UPLOAD_FILE_MAX_SIZE) {
                throw new Error('file size larger than allowed');
                return false;
            }

            if (!($.inArray((extension), config.UPLOAD_EXTENSIONS_ALLOWED) !== -1)) {
                throw new Error('extension not allowed!');
                return false;
            }

            let payload = {
                'id': utilsJS.uuidv4(),
                'title': metadata.name,
                'extension': extension
            };

            chatWidget.sendMessage(metadata);
        }));

        //Init localstorage settings from session data
        localStorage.removeItem('curuchat_widget_' + key);
        localStorage.setItem('curuchat_widget_' + key, JSON.stringify(curuchatSettings));

        //Check status occurrence
        if (session.token && session.key) {
            let id_occurrence = '';
            chatWidget.status(session.token, id_occurrence, function (response) {
                if (response.status) {
                    response.data['key'] = response.data.token_channel_queue;
                    curuchatSettings.data = response.data;
                    chatWidget.setCuruchatData(curuchatSettings);

                    //auto open widget chat if exists occurrence
                    if (curuchatSettings.data.token) {
                        $('#curuchat-chat-welcome-container').remove();
                        curuchatSettings.data.id_message_last = 1;
                        chatWidget.setCuruchatData(curuchatSettings);
                    }

                    //start routine checking new message
                    if (curuchatSettings.data.token) {
                        curuchatSettings.state.isConnected = true;
                        curuchatSettings.state.isCheckingStatus = true;
                        curuchatSettings.state.isCheckingNewMessages = true;
                        chatWidget.setCuruchatData(curuchatSettings);
                    }
                } else {
                    console.log('faz nada');
                    chatWidget.resetChat(function () {
                        //do nothing
                    });
                }
            });
        }

        //Start routine
        chatWidget.startCheckingNewMessages();
        chatWidget.startCheckingStatus(5000);
    },

    sendMessage: function (body) {
        //clean up fields
        $('textarea[id="msg-textarea"]').val('');

        let curuchatSettings = chatWidget.getCuruchatData();
        let payload = {
            'key': curuchatSettings.data.key,
            'token': curuchatSettings.data.token,
            'body': typeof body !== 'object' ? body : '',
            'attach': typeof body === 'object' ? body : 0,
            'id_type': config.OCCURRENCE_TYPE_MESSAGE,
            'fl_sent': 0
        };

        if (curuchatSettings.data.id_occurrence) {
            payload.id_occurrence = curuchatSettings.data.id_occurrence;
        }

        payload = chatWidget.buildFormData(payload);
        chatWidget.persist(payload, function (response) {
            if (response.id_occurrence && response.status) {
                //set id_occurrence
                if (!curuchatSettings.data.id_occurrence && response.id_occurrence) {
                    curuchatSettings.data.id_occurrence = response.id_occurrence;
                    chatWidget.setCuruchatData(curuchatSettings);
                }

                //start routine checking if not started
                if (curuchatSettings.state.isCheckingNewMessages === false) {
                    curuchatSettings.state.isCheckingStatus = true;
                    curuchatSettings.state.isCheckingNewMessages = true;
                    chatWidget.setCuruchatData(curuchatSettings);
                }

                //chatWidget.startCheckingStatus(5000);
            } else {
                chatWidget.connectTask(function () {
                    chatWidget.sendMessage(body);
                });
            }
        });
    },

    connect: function (callback) {
        var key = utilsJS.getRouteParameter(4);
        if (!key) {
            throw Error('invalid key');
            return false;
        }

        $.ajax({
            type: 'POST',
            url: '/api/chat/connect',
            dataType: 'JSON',
            data: {
                key: key
            },
            async: true,
            complete: function (response) {
                if (typeof callback == 'function') {
                    callback(JSON.parse(response.responseText), response.status);
                }
            }
        });
    },

    status: function (token, id_occurrence, callback) {
        $.ajax({
            type: 'GET',
            url: '/api/chat/status',
            data: {
                token: token,
                id_occurrence: id_occurrence,
                key: key
            },
            complete: function (response) {
                if (typeof callback == 'function') {
                    callback(JSON.parse(response.responseText));
                }
            }
        });
    },

    persist: function (data, callback) {
        $.ajax({
            type: 'POST',
            url: '/api/chat/persist',
            data: data,
            async: true,
            processData: false,
            contentType: false,
            complete: function (response) {
                if (typeof callback == 'function') {
                    callback(JSON.parse(response.responseText));
                }
            }
        });
    },

    persistEvent: function (id_occurrence, message, callback) {
        $.ajax({
            type: 'POST',
            url: '/api/chat/event',
            data: {
                id_occurrence: id_occurrence,
                message: message,
                fl_sent: 0
            },
            async: true,
            complete: function (response) {
                if (typeof callback == 'function') {
                    callback(JSON.parse(response.responseText));
                }
            }
        });
    },

    persistFinish: function (id_occurrence, callback) {
        $.ajax({
            type: 'POST',
            url: '/api/chat/finish',
            data: {
                id_occurrence: id_occurrence,
                fl_sent: 0
            },
            async: true,
            complete: function (response) {
                if (typeof callback == 'function') {
                    callback(JSON.parse(response.responseText));
                }
            }
        });
    },

    renderInteraction: function (interaction, callback = null) {
        if (!$('div[data-id-interaction="' + interaction.id_interaction + '"]')[0]) {
            let orientation = (interaction.fl_sent == 1) ? 'left' : 'right';
            let bodyInteraction = null;
            let bodyText = interaction.body;
            let classType = 'plain-text';
            let interactiveButtons = '';

            if (interaction.body_interactive && interaction.body_interactive != '') {
                let buttons = JSON.parse(interaction.body_interactive);
                $.each(JSON.parse(interaction.body_interactive), function (index, interaction) {
                    if (interaction.type === 'buttons') {
                        let options = '';
                        if (interaction.content.length > 0) {
                            $.each(interaction.content, function (index, value) {
                                options += $('<li />').html($('<div />').html(value.text).get(0).outerHTML).get(0).outerHTML;
                            });
                        }
                        interactiveButtons = $('<ul />').addClass('curuchat-interactive-buttons').html(options).get(0).outerHTML;
                    }
                });
            }

            let attachElements = '';
            if (interaction.attachs?.[0] !== undefined) {
                let attach = interaction.attachs[0];
                let url = '/attachments/render/' + attach.token;

                if (bodyText == '') {
                    classType = 'attachment';
                }

                if (($.inArray(attach.extension, ['webp']) !== -1)) {
                    //case attach is a sticker
                    attachElements = $('<div />').addClass('background img-border ratio ratio1-1 pointer')
                        .css('background-image', 'url(' + url + ')')
                        .css('border-radius', '13px 13px 13px 0px').get(0).outerHTML;
                    attachElements = $('<div />').addClass('header sticker').html(attachElements).get(0).outerHTML;

                    classType += ' sticker';

                } else if (($.inArray(attach.extension, ['jpg', 'jpeg', 'png', 'gif']) !== -1)) { //case attach is a  image
                    //case attach is a image
                    attachElements = $('<div />').addClass('background img-border ratio ratio1-1 pointer')
                        .css('background-image', 'url(' + url + ')')
                        .css('border-radius', '13px 13px 13px 0px').get(0).outerHTML;
                    attachElements = $('<div />').addClass('header image').html(attachElements).get(0).outerHTML;

                } else {

                    let fileIconImage = $('<img />').addClass('file-icon').attr('src', '/assets/img/extensions/' + attach.extension + '.png').get(0).outerHTML;
                    let fileIcon = $('<div />').addClass('file-icon-wrapper').html(fileIconImage).get(0).outerHTML;

                    let linkSpanDescription = $('<span />').addClass('text big-text').attr('title', attach.title).html(attach.title).get(0).outerHTML;
                    let linkDescription = $('<div />').addClass('link-description').html(linkSpanDescription).get(0).outerHTML;

                    let size = ((attach.size / 10) > 1000) ? (attach.size / 10000).toFixed(1) + 'MB' : (((attach.size / 10) > 1) ? ((attach.size / 10).toFixed(0) + 'KB') : attach.size + 'KB');
                    let sizeDescription = $('<div />').addClass('text small-text').html(size).get(0).outerHTML;
                    let descriptionWrapper = $('<div />').addClass('description-wrapper').html(linkDescription + sizeDescription).get(0).outerHTML;

                    attachElements = $('<div />').addClass('file-wrapper pointer').html(fileIcon + descriptionWrapper).get(0).outerHTML;

                    let urlFile = '/attachments/download/' + attach.token;
                    attachElements = $('<a />').attr('href', urlFile).attr('target', '_blank').html(attachElements).get(0).outerHTML;
                }
            }

            bodyText = (bodyText) ? $('<div />').addClass('plain-text').html(bodyText).get(0).outerHTML : '';
            bodyInteraction = $('<div />').addClass('message-elements').html(attachElements + bodyText).get(0).outerHTML;

            let bubbleContent = bodyInteraction;
            let bubbleInteractive = $('<div />').addClass('fixed-options disable-selection').html(interactiveButtons).get(0).outerHTML;
            let bubbleContainer = $('<div />').addClass('bubble ' + orientation + ' ' + classType).html(bubbleContent + bubbleInteractive).get(0).outerHTML;
            let datetime = $('<div />').addClass('flex group-notification ' + orientation).html($('<div />').html(((moment(interaction.dt_created, "DD/MM/YYYY HH:mm:ss")).format('HH:mm'))).get(0).outerHTML).get(0).outerHTML;
            let cardContainer0 = $('<div />').addClass('curuchat-container curuchat-card select ').html(bubbleContainer).get(0).outerHTML;
            let cardContainer1 = $('<div />').addClass('curuchat-card-container').html(cardContainer0).get(0).outerHTML;
            let cardContainer2 = $('<div />').addClass(orientation).html(cardContainer1).get(0).outerHTML;
            let cardContainer3 = $('<div />').addClass('curuchat-relative').html(cardContainer2 + datetime).get(0).outerHTML;
            let cardContainer4 = $('<div />').addClass('curuchat-card-group ' + orientation).html(cardContainer3).get(0).outerHTML;

            let element = $('<div />').attr('data-id-interaction', interaction.id_interaction).addClass('curuchat-message-group').html(cardContainer4);

            $('.curuchat-conversations').append(element);
            chatWidget.scrollToTop();
            if (typeof callback == 'function') {
                callback({status: true, message: 'messages rendered'});
            }
        }
    },

    renderAttach: function (filename, index) {
        var aux = filename.split('.');
        var extension = aux[aux.length - 1];
        delete aux[aux.length - 1];
        var filename = utilsJS.sanitizeFilename((aux.join('')).toLowerCase());
        var attach = '<div class="attach" data-token="' + index + '" title="' + filename + '. ' + extension + '">\n' +
            '           <img src="/assets/img/extensions/' + extension + '.png">\n' +
            '           <i class="fa fa-times-circle">&nbsp;</i>\n' +
            '        </div>';


        $('.fab_field .attachments').append(attach);
        return true;
    },

    renderFinishEvent: function (date) {
        let eventFinish = '<div class="box-chat-event text-center"><div class="text"><span class="delimiter"><span>Atendimento finalizado</span><p class="details">' + date + '</p></span></div></div>';
        setTimeout(function () {
            $('.curuchat-conversations').append(eventFinish);
            chatWidget.scrollToTop();
        }, 1500);
    },

    startCheckingNewMessages: function (runOnce = false) {
        //check if exists occurrence data
        var data = chatWidget.getCuruchatData();
        if (!data) {
            setTimeout(function () {
                chatWidget.startCheckingNewMessages();
            }, 1000);
            return false;
        }

        if (!runOnce) {
            //check is state isCheckingNewMessages was set to true
            if (data.state.isCheckingNewMessages == false) {
                setTimeout(function () {
                    chatWidget.startCheckingNewMessages();
                }, 1000);
                return false;
            }
        }

        let token = data.data.token;
        if (!token) {
            throw Error('invalid token');
        }

        //get last id_interaction
        var id_interactions = [];
        $.each($('div[data-id-interaction]'), function (index, value) {
            id_interactions.push(parseInt($(value).attr('data-id-interaction')));
        });
        let id_interaction = (id_interactions.length > 0) ? Math.max.apply(Math, id_interactions) : 1;
        id_interaction = (!runOnce) ? id_interaction : 1;

        var id_occurrence = data.data.id_occurrence ? data.data.id_occurrence : '';
        chatWidget.checkNewMessages(token, id_occurrence, id_interaction, function (response) {
            if (response.status) {
                if (response.data.interactions && response.data.interactions.length > 0) {
                    $.each(response.data.interactions, function (index, message) {
                        chatWidget.renderInteraction(message);
                    });
                }
            }

            setTimeout(function () {
                chatWidget.startCheckingNewMessages();
            }, 1000);
        });
    },

    checkNewMessages: function (token, id_occurrence = null, id_interaction, callback) {
        if (!token) {
            throw Error('invalid token');
        }

        if (!id_interaction) {
            id_interaction = 0;
        }

        requestCheckMessages = $.ajax({
            type: 'POST',
            url: '/api/chat/check',
            dataType: 'JSON',
            data: {
                token: token,
                id_occurrence: id_occurrence,
                id_interaction: id_interaction,
                type: 'simple'
            },
            async: true,
            complete: function (response) {
                if (typeof callback == 'function') {
                    try {
                        callback(JSON.parse(response.responseText));
                    } catch (e) {
                        console.log(e);
                        callback({
                            "status": true,
                            "data": {
                                "interactions": [],
                                "occurrence": {"fl_chat_finished": "0", "dt_chat_finished": null, "fl_handover": "1"}
                            }
                        });
                    }
                }
            }
        });
    },

    startCheckingStatus: function (interval) {

        //check if exists occurrence data
        var data = chatWidget.getCuruchatData();
        if (!data) {
            console.log('[status] localstorage data not found');
            setTimeout(function () {
                chatWidget.startCheckingStatus(interval);
            }, interval);
            return;
        }

        if (data.state.isCheckingStatus == false || data.state.isCheckingNewMessages == false) {
            //console.log('[status] state isCheckingNewMessages is false');
            setTimeout(function () {
                chatWidget.startCheckingStatus(interval);
            }, interval);
            return;
        }

        var token = data.data.token;
        if (!token) {
            console.log('[status] invalid token');
            throw Error('invalid token');
            return false;
        }

        let id_occurrence = data.data.id_occurrence ? data.data.id_occurrence : '';
        chatWidget.status(token, id_occurrence, function (response) {

            if (!response.status) {
                chatWidget.resetChat();
                setTimeout(function () {
                    chatWidget.startCheckingStatus(interval);
                }, interval);
                return false;
            }

            if (response.data) {
                response.data['key'] = response.data.token_channel_queue;
                curuchatSettings.data = response.data;
                if (parseInt(curuchatSettings.data.fl_occurrence_full_finished) === 1) {
                    console.log('[log] occurrence closed');

                    curuchatSettings.state.isConnected = false;
                    curuchatSettings.state.isCheckingStatus = false;
                    curuchatSettings.state.isCheckingNewMessages = false;
                    curuchatSettings.state.isFullFinished = true;
                    chatWidget.setCuruchatData(curuchatSettings);
                    chatWidget.renderFinishEvent(response.data.dt_chat_finished);
                    try {
                        if (requestCheckMessages) {
                            setTimeout(function () {
                                requestCheckMessages.abort();
                            }, 2000);
                        }
                    } catch (e) {

                    }
                    setTimeout(function () {
                        chatWidget.startCheckingStatus(interval);
                    }, interval);
                    return false;
                }
            }

            curuchatSettings.state.isCheckingNewMessages = true;
            curuchatSettings.state.isCheckingStatus = true;
            curuchatSettings.state.isConnected = true;
            chatWidget.setCuruchatData(curuchatSettings);

            setTimeout(function () {
                chatWidget.startCheckingStatus(interval);
            }, interval);
        });
    },

    resetChat: function (callback) {
        Cookies.remove(session.name);
        session = {};
        $('.curuchat-conversations').html('');
        let reset = {
            'data': {},
            'state': {
                'isConnected': false,
                'isCheckingNewMessages': false,
                'isFullFinished': false
            }
        };
        localStorage.setItem('curuchat_widget_' + key, JSON.stringify(reset));
        if (typeof callback == 'function') {
            callback();
        }
    },

    getCuruchatData: function () {
        if (!localStorage.getItem('curuchat_widget_' + key)) {
            return false;
        }
        curuchatSettings = JSON.parse(localStorage.getItem('curuchat_widget_' + key));
        return curuchatSettings;
    },

    setCuruchatData: function (data) {
        if (!data) {
            return false;
        }
        localStorage.setItem('curuchat_widget_' + key, JSON.stringify(data));
        curuchatSettings = data;
        return data;
    },

    checkForAutoOpenWidget: function () {
        $('.chat_pre_occurrence button').click();
        //chatWidget.setStyleChatBox(1);
        //chatWidget.openChatBox();
        if (!curuchatSettings.data.token) {
            setTimeout(function () {
                chatWidget.sendMessage('%%%_START_%%%');
            }, 1000);
        }
    },

    scrollToTop: function () {
        $('.curuchat-cards-items-list').scrollTop($('.curuchat-cards-items-list')[0].scrollHeight);
    },

    buildFormData: function (object) {
        const formData = new FormData();
        Object.keys(object).forEach(key => {
            formData.append(key, object[key])
        })
        return formData;
    },

    buildInteractiveButtons: function (buttons) {
        let interactiveButtons = '';
        $.each(JSON.parse(buttons), function (index, interaction) {
            if (interaction.type === 'buttons') {
                let options = '';
                if (interaction.content.length > 0) {
                    $.each(interaction.content, function (index, value) {
                        options += $('<li />').html($('<div />').html(value.text).get(0).outerHTML).get(0).outerHTML;
                    });
                }
                interactiveButtons = $('<ul />').html(options).get(0).outerHTML;
            }
        });
        return interactiveButtons;
    },

    connectTask: function (callback = null) {
        console.log('[curuchat] webchat connecting...');
        let curuchatSettings = chatWidget.getCuruchatData();
        $('#curuchat-chat-welcome-container').remove();
        if (!curuchatSettings.state.isConnected) {
            chatWidget.connect(function (response, code) {
                if (code === 200) {
                    key = response.data.key;
                    curuchatSettings.data = response.data;
                    curuchatSettings.state.isConnected = true;
                    curuchatSettings.state.isCheckingNewMessages = false;
                    curuchatSettings.data.id_message_last = 1;
                    chatWidget.setCuruchatData(curuchatSettings);

                    if (Cookies.get('PHPSESSID') != response.data.name) {
                        setTimeout(function () {
                            chatWidget.connectTask(callback);
                        }, 1000);
                    }

                    if (typeof callback == 'function') {
                        callback(response.data);
                    }
                }
            });
        }
    },

    sendAutoStartMessage: function () {
        let qtdInteractions = parseInt($('div[data-id-interaction]').length);
        if (qtdInteractions === 0) {
            let settings = chatWidget.getCuruchatData();
            if (!settings.state.isCheckingNewMessages) {
                chatWidget.sendMessage('%%%_START_%%%');
                return true;
            }
        }
    }
}

$(document).ready(function () {
    curuchatIframeParentComponent = window.parent;

    //handshake
    console.log('[webchat] loaded');

    curuchatIframeParentComponent.postMessage("shakehand", "*");
    window.addEventListener("message", (e) => {
        console.log('[postMessage event] ' + JSON.stringify(e));

        if (e.data == 'shakehand') {//shakehank event
            console.log("[curuchat] shakehand received from parent");

            //set listening button close  bind
            $('body').delegate('#curuchat-chat-header svg', 'click', $.debounce(200, true, function (e) {
                e.preventDefault();
                curuchatIframeParentComponent.postMessage('toggleChat', "*");
                console.log('[webchat] toggle requested');
            }));
        }

        if (e.data === 'sendAutoStartMessage') {//sendAutoStartMessage event
            function isConnectedFunction() {
                try {
                    let settings = chatWidget.getCuruchatData();
                    if (typeof (settings.data.key) != "undefined" && typeof (settings.data.token) != "undefined" && typeof (settings.state.isConnected) != "undefined") {
                        return (settings.data.key && settings.data.token && settings.state.isConnected);
                    }
                    return false;
                } catch (e) {
                    return false;
                }
            }

            let isConnected = isConnectedFunction();
            if (!isConnected) {
                chatWidget.connectTask(function () {
                    chatWidget.sendAutoStartMessage();
                });
            } else {
                chatWidget.sendAutoStartMessage();
            }
        }
    });

    chatWidget.initBinds();

});
