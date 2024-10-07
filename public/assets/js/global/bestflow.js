window.location.getQueryParams = function(query) {
    if (!query) {
        
        query = window.location.search
    }
    
    if(query.trim() == ""){
        return [];
    }
    
    query = decodeURIComponent(query.trim().substr(1,query.length));
    arrLinhas = query.split("&");
    
    var arrRetorno = [];
    for(i = 0; i < arrLinhas.length; i++){
        arrCampos = arrLinhas[i].split("=");
        arrRetorno[arrCampos[0].trim()] = arrCampos[1].trim();
    }
    
    return arrRetorno;
    
}


function validarCnpj(valor)
{

    // obtém somente os números
    let cnpj = valor.replace(/\D/gm,'');
    // expressão regular para validar o cnpj
    let regEx = /^[0-9]{14}$/;
    // verifica se o cep está no formato válido
    if (regEx.test(cnpj))
    {
        consultarCnpj(cnpj);
    } else {
        utilsJS.toastNotify(false,'Cnpj em formato inválido!');
        limparDadosCnpj();
    }
}

function limparDadosCnpj()
{
    document.getElementById('cnpj').value = "";
    document.getElementById('tipo').value = "";
    document.getElementById('porte').value = "";
    document.getElementById('nome').value = "";
    document.getElementById('fantasia').value = "";
    document.getElementById('abertura').value = "";
    document.getElementById('cep').value = "";
    document.getElementById('logradouro').value = "";
    document.getElementById('numero').value = "";
    document.getElementById('complemento').value = "";
    document.getElementById('bairro').value = "";
    document.getElementById('localidade').value = "";
    document.getElementById('uf').value = "";
    document.getElementById('ibge').value = "";
    document.getElementById('ddd').value = "";
    document.getElementById('telefone').value = "";
    document.getElementById('celular').value = "";
    document.getElementById('email').value = "";
    document.getElementById('contato').value = "";
}

function consultarCnpj(valor)
{

    $.ajax({
        url:'https://www.receitaws.com.br/v1/cnpj/' + valor,
        method:'GET',
        dataType: 'jsonp', // Em requisições AJAX para outro domínio é necessário usar o formato "jsonp" que é o único aceito pelos navegadores por questão de segurança
        complete: function(xhr){

            // Aqui recuperamos o json retornado
            response = xhr.responseJSON;

            // Na documentação desta API tem esse campo status que retorna "OK" caso a consulta tenha sido efetuada com sucesso
            if(response.status == 'OK') {
                $('#telefone').val("");
                $('#celular').val("");
                // Agora preenchemos os campos com os valores retornados
                $('#razao_social').val(response.nome);
                $('#identificacao_conta').val(response.fantasia);

                if(response.telefone.includes('/')){
                    var telefone = response.telefone.split("/");
                    $('#telefone').val(telefone[0]);
                    $('#celular').val(telefone[1]);
                }else{
                    $('#telefone').val(response.telefone);
                }
                let cep = response.cep.replace(/\./g, '');
                $('#cep').val(cep);
                $('#endereco').val(response.logradouro);
                $('#numero').val(response.numero);
                $('#complemento').val(response.complemento);
                $('#bairro').val(response.bairro);
                $('#cidade').val(response.municipio);
                $('#estado').val(response.uf);

                // Aqui exibimos uma mensagem caso tenha ocorrido algum erro
            } else {
                utilsJS.toastNotify(false,response.message); // Neste caso estamos imprimindo a mensagem que a própria API retorna
            }
        }
    });

}

function NewWindow(v_url){
    var varWindow = window.open (v_url, 'popup' ) 
    return varWindow;
}

var arrQueryParams = location.getQueryParams();
var v_last_url = "";

/*if(!window.sendPost){
    window.sendPost = function(url, obj){
        //Define o formulário
        var myForm = document.createElement("form");
        myForm.action = url;
        myForm.method = "post";
        for(var key in obj) {
             var input = document.createElement("input");
             input.type = "hidden";
             input.value = obj[key];
             input.name = key;
             myForm.appendChild(input);	
        }
        //Adiciona o form ao corpo do documento
        document.body.appendChild(myForm);
        //Envia o formulário
        myForm.submit();
    } 
}*/


/*FunÃ§Ã£o que padroniza valor monÃ©tario*/
function float2moeda(num) {

   x = 0;

   if(num<0) {
      num = Math.abs(num);
      x = 1;
   }

   if(isNaN(num)) num = "0";
      cents = Math.floor((num*100+0.5)%100);

   num = Math.floor((num*100+0.5)/100).toString();

   if(cents < 10) cents = "0" + cents;
      for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++)
         num = num.substring(0,num.length-(4*i+3))+'.'
               +num.substring(num.length-(4*i+3));

   ret = num + ',' + cents;

   if (x == 1) ret = ' - ' + ret;return ret;

}

function moeda2float(moeda){


	strResultado = "";
		
	for(indmoeda = 0; indmoeda < moeda.length; indmoeda++){
		if(moeda.charAt(indmoeda) != '.'){
			strResultado += moeda.charAt(indmoeda);
		}
	}

	moeda = strResultado.replace(",",".");

	return parseFloat(moeda);

}



function abrirMenu(v_url){
    sendPost(v_url, {token: token});
}
function abrirMenuMovimentar(v_url){
    sendPost(v_url, {token: token,leads_pk:"",colaborador_pk:"",pk:""});
}

function routes_api(vController, vJob, v_ParametrosJob){
    
    var v_strParametros = "";
    var url = "";

    if(v_ParametrosJob){    
        $.each( v_ParametrosJob, function( key, value ) {
            v_strParametros += "&"+key+"="+encodeURIComponent(value);
        });
    }
    
    url = "/api/"+vController+"/"+vJob+"?"+v_strParametros;
    
    v_last_url = url;
    
    return url;
}
function routes(vController, vJob, v_ParametrosJob){

    var v_strParametros = "";
    var url = "";

    if(v_ParametrosJob){
        $.each( v_ParametrosJob, function( key, value ) {
            v_strParametros += "&"+key+"="+encodeURIComponent(value);
        });
    }

    url = "/"+vController+"/"+vJob+"?"+v_strParametros;

    v_last_url = url;

    return url;
}

function routesDocumentos(vController, vJob, vParametrosJob){

    var url = "";


    url = "/"+vController+"/"+vJob;


    var arrRetornoCarregarControle;

    var request = $.ajax({
        url:          url,
        data:         vParametrosJob,
        processData:  false,
        cache:        false,
        async:        false,
        dataType:     'json',
        contentType:  false,
        type:         'post'
    });
    request.done(function(output){
        if (output.status == true){
            arrRetornoCarregarControle = output;
        }else{
            utilsJS.toastNotify(false, 'Falhou a requisição: '+output.message);
        }
    });
    request.fail(function(jqXHR, textStatus){
        utilsJS.toastNotify(false, 'Falhou a requisição: '+textStatus);
    });

    return arrRetornoCarregarControle;

}
function sendPost(vController, vJob, vParametrosJob){


    var url = routes(vController, vJob, vParametrosJob);
    window.location.href = url;
}

function carregarController(vController, vJob, vParametrosJob){
    
    var v_strParametros = "";
    
    var url = routes_api(vController, vJob, vParametrosJob);
   
    var arrRetornoCarregarControle;
    
    var request = $.ajax({
        url:          url,
        cache:        false,
        async:        false,
        dataType:     'json',
        contentType:  'application/json; charset=utf-8',
        type:         'post'
    });
    request.done(function(output){
        if (output.status == true){
            arrRetornoCarregarControle = output;
        }else{
            utilsJS.toastNotify(false, 'Falhou a requisição: '+output.message);
        }
    });
    request.fail(function(jqXHR, textStatus){

        utilsJS.toastNotify(false, 'Falhou a requisição: '+textStatus);
    });

    return arrRetornoCarregarControle;
    
}

function carregarComboAjax(objCBO, arrDadosCarregarCombo, vValorPrimeiroItem, vPk, vDescricao){
    
    if (arrDadosCarregarCombo.status == true){
        //limpa o combo
        objCBO.empty();
        var arrDados = (arrDadosCarregarCombo.data);
        //adiciona um item vazio
        if(vValorPrimeiroItem!=""){
            objCBO.append($('<option>', {
                value: "",
                text: vValorPrimeiroItem
            }));
        }
        //carrega com a nova lista.
        for(i = 0; i < arrDados.length; i++){
            objCBO.append($('<option>', {
                value: arrDados[i][vPk],
                text: arrDados[i][vDescricao],
            }));
        }

    } 
    
}

function arrayToJson(arrKeys, arrDados) {

    var i, s = '[';
    for (i = 0; i < arrDados.length; ++i) {
        s += "{";
        for(j = 0; j < arrKeys.length; ++j){
            s += '"' + arrKeys[j] + '":"' + arrDados[i][j] + '"';
            if (j < arrKeys.length - 1) {
                s += ',';
            }
        }
        s += "}";
        if (i < arrDados.length - 1) {
            s += ',';
        }            
    }
    s += ']';
    return s;
}
function mascara(o,f){
    v_obj=o
    v_fun=f
    setTimeout('execmascara()',1);
}
 
function execmascara(){
    v_obj.value=v_fun(v_obj.value);
}


function chama_mascara(o) {
	if (o.value.length > 14)
		mascara(o, cnpj);
	else
		mascara(o, cpf);
}

function cpf(v) {
	v = v.replace( /\D/g , ""); //Remove tudo o que não é dígito
	v = v.replace( /(\d{3})(\d)/ , "$1.$2"); //Coloca um ponto entre o terceiro e o quarto dígitos
	v = v.replace( /(\d{3})(\d)/ , "$1.$2"); //Coloca um ponto entre o terceiro e o quarto dígitos
	//de novo (para o segundo bloco de números)
	v = v.replace( /(\d{3})(\d{1,2})$/ , "$1-$2"); //Coloca um hífen entre o terceiro e o quarto dígitos
	return v;
}

function cnpj(v) {
	v = v.replace( /\D/g , ""); //Remove tudo o que não é dígito
	v = v.replace( /^(\d{2})(\d)/ , "$1.$2"); //Coloca ponto entre o segundo e o terceiro dígitos
	v = v.replace( /^(\d{2})\.(\d{3})(\d)/ , "$1.$2.$3"); //Coloca ponto entre o quinto e o sexto dígitos
	v = v.replace( /\.(\d{3})(\d)/ , ".$1/$2"); //Coloca uma barra entre o oitavo e o nono dígitos
	v = v.replace( /(\d{4})(\d)/ , "$1-$2"); //Coloca um hífen depois do bloco de quatro dígitos
	return v;
}

//data
function mdata(v){
    v=v.replace(/\D/g,"");    //Remove tudo o que não é dígito
    v=v.replace(/(\d{2})(\d)/,"$1/$2");       
    v=v.replace(/(\d{2})(\d)/,"$1/$2");       
                                             
    v=v.replace(/(\d{2})(\d{2})$/,"$1$2");
    return v;
}

function mascaraTelefone(v){
    var r = v.replace(/\D/g, "");
    r = r.replace(/^0/, "");
    if (r.length > 10) {
      r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1)$2-$3");
    } else if (r.length > 5) {
      r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1)$2-$3");
    } else if (r.length > 2) {
      r = r.replace(/^(\d\d)(\d{0,5})/, "($1)$2");
    } else {
      r = r.replace(/^(\d*)/, "($1");
    }
    return r;

}

function moeda(v){
    v=v.replace(/\D/g,""); // permite digitar apenas numero
    v=v.replace(/(\d{1})(\d{17})$/,"$1.$2"); // coloca ponto antes dos ultimos digitos
    v=v.replace(/(\d{1})(\d{13})$/,"$1.$2"); // coloca ponto antes dos ultimos 13 digitos
    v=v.replace(/(\d{1})(\d{8})$/,"$1.$2"); // coloca ponto antes dos ultimos 8 digitos
    v=v.replace(/(\d{1})(\d{5})$/,"$1.$2"); // coloca ponto antes dos ultimos 5 digitos
    v=v.replace(/(\d{1})(\d{1,2})$/,"$1,$2"); // coloca virgula antes dos ultimos 4 digitos
    return v;
}
function porcentagem(v){
    v=v.replace(/\D/g,""); // permite digitar apenas numero
    v=v.replace(/(\d{1})(\d{17})$/,"$1.$2"); // coloca ponto antes dos ultimos digitos
    v=v.replace(/(\d{1})(\d{13})$/,"$1.$2"); // coloca ponto antes dos ultimos 13 digitos
    v=v.replace(/(\d{1})(\d{8})$/,"$1.$2"); // coloca ponto antes dos ultimos 8 digitos
    v=v.replace(/(\d{1})(\d{5})$/,"$1.$2"); // coloca ponto antes dos ultimos 5 digitos
    v=v.replace(/(\d{1})(\d{1,2})$/,"$1,$2"); // coloca virgula antes dos ultimos 4 digitos
    return v;
}

function soNumeros(v){
    return v.replace(/\D/g,"");
}

function horamask(v) {
    v = v.replace(/\D/g, "");                 //Remove tudo o que n&#227;o &#233; d&#237;gito
    v = (v.substring(0, 1) > 2) ? "" : v;
    v = (v.substring(0, 1) == 1 && v.substring(1, 2) > 9) ? v.substring(0, 1) : v;
    v = (v.substring(0, 1) == 0 && v.substring(1, 2) > 9) ? v.substring(0, 1) : v;
    v = (v.substring(2, 3) > 5) ? v.substring(0, 2) : v;
    v = v.replace(/(\d{2})(\d)/, "$1:$2");    //Coloca dois pontos entre o segundo e terceiro d&#237;gitos
    v = (v.length > 5) ? v.substring(0, 5) : v;
    return v;
}
function horamasksemanal(v) {
    v = v.replace(/\D/g, "");                 //Remove tudo o que n&#227;o &#233; d&#237;gito
    v = (v.substring(0, 1) > 9) ? "" : v;
    v = (v.substring(0, 1) == 1 && v.substring(1, 2) > 9) ? v.substring(0, 1) : v;
    v = (v.substring(0, 1) == 0 && v.substring(1, 2) > 9) ? v.substring(0, 1) : v;
    v = (v.substring(2, 3) > 5) ? v.substring(0, 2) : v;
    v = v.replace(/(\d{2})(\d)/, "$1:$2");    //Coloca dois pontos entre o segundo e terceiro d&#237;gitos
    v = (v.length > 5) ? v.substring(0, 5) : v;
    return v;
}

function cep(d){
    d = soNumeros(d);
    d=d.replace(/^(\d{5})(\d)/,"$1-$2");
    return d;
}

function permissao(ds_dominio_modulo,ic_acao){
    var v_strParametros = "";
    var objParametros = {
        "ds_dominio_modulo":ds_dominio_modulo,
        "ic_acao":ic_acao
    };

    var url = routes_api("usuario", "verificarPermissao", objParametros);
    var arrRetornoCarregarControle;

    var request = $.ajax({
        url:          url,
        cache:        false,
        async:        false,
        dataType:     'json',
        contentType:  'application/json; charset=utf-8',
        type:         'post'
    });
    request.done(function(output){
        if (output.status == true){
            arrRetornoCarregarControle = output;
        }
        else{
            arrRetornoCarregarControle = output;
        }
    });
    request.fail(function(jqXHR, textStatus){
        utilsJS.toastNotify(false, 'Falhou a requisição: '+textStatus);
    });

    return arrRetornoCarregarControle;
    
}
function permissaoMenu(){
    var v_strParametros = "";
    var objParametros = {
    };

    var url = routes_api("usuario", "verificarPermissaoMenu", objParametros);
    var arrRetornoCarregarControle;

    var request = $.ajax({
        url:          url,
        cache:        false,
        async:        false,
        dataType:     'json',
        contentType:  'application/json; charset=utf-8',
        type:         'post'
    });
    request.done(function(output){
        if (output.status == true){
            arrRetornoCarregarControle = output;
        }
        else{
            arrRetornoCarregarControle = output;
        }
    });
    request.fail(function(jqXHR, textStatus){
        utilsJS.toastNotify(false, 'Falhou a requisição: '+textStatus);
    });

    return arrRetornoCarregarControle;

}


function carregarComboAjaxResponsavel(objCBO, arrDadosCarregarCombo, vValorPrimeiroItem, vPk, vDescricao){
    
    if (arrDadosCarregarCombo.result == 'success'){
        //limpa o combo
        objCBO.empty();

        //adiciona um item vazio
        if(vValorPrimeiroItem!=""){
            objCBO.append($('<option>', {
                value: "",
                text: vValorPrimeiroItem
            }));
        }
        objCBO.append($('<option>', {
            value: "Null",
            text: "Nenhuma"
        }));
        //carrega com a nova lista.
        for(i = 0; i < arrDadosCarregarCombo.data.length; i++){
            objCBO.append($('<option>', {
                value: arrDadosCarregarCombo.data[i][vPk],
                text: arrDadosCarregarCombo.data[i][vDescricao],
            }));
        }

    } 
    
}
function permissaoLogin(ds_dominio_modulo,ic_acao,token){
    
    var url = "../controller/usuario.controller.php?"+"job=verificarPermissao&token="+token+"&ds_dominio_modulo="+ds_dominio_modulo+"&ic_acao="+ic_acao;

    var arrRetornoCarregarControle;
    
    var request = $.ajax({
        url:          url,
        cache:        false,
        async:        false,
        dataType:     'json',
        contentType:  'application/json; charset=utf-8',
        type:         'post'
    });
    request.done(function(output){
        if (output.result == 'success'){
            arrRetornoCarregarControle = output;
        } 
        else{
            arrRetornoCarregarControle = output;
            //alert(output.message);
            //sendPost("../index.php", {token: token});
        }
    });
    request.fail(function(jqXHR, textStatus){
        utilsJS.toastNotify(false, 'Falhou a requisição: '+textStatus);
    });

    return arrRetornoCarregarControle;
    
}

function DataYMD(strData){
	var arr = strData.split("/");
	return arr[2]+"-"+arr[1]+"-"+arr[0];
}

function fcCarregarCep(ds_cep){
    $(document).ready(function () {
        function limpa_formulário_cep() {
            // Limpa valores do formulário de cep.
            $("#ds_endereco").val("");
            $("#ds_bairro").val("");
            $("#ds_cidade").val("");
            $("#ds_uf").val("");
        }

        //Nova variável "cep" somente com dígitos.
        var cep = ds_cep.replace(/\D/g, '');

        //Verifica se campo cep possui valor informado.
        if (cep != "") {

            //Expressão regular para validar o CEP.
            var validacep = /^[0-9]{8}$/;

            //Valida o formato do CEP.
            if (validacep.test(cep)) {

                //Preenche os campos com "..." enquanto consulta webservice.
                $("#ds_endereco").val("...");
                $("#ds_bairro").val("...");
                $("#ds_cidade").val("...");
                $("#ds_uf").val("...");
                $("#ibge").val("...");

                //Consulta o webservice viacep.com.br/
                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {

                    if (!("erro" in dados)) {
                        //Atualiza os campos com os valores da consulta.
                        $("#ds_endereco").val(dados.logradouro);
                        $("#ds_bairro").val(dados.bairro);
                        $("#ds_cidade").val(dados.localidade);
                        $("#ds_uf").val(dados.uf);
                        //$("#ibge").val(dados.ibge);
                    } else {
                        //CEP pesquisado não foi encontrado.
                        limpa_formulário_cep();

                        utilsJS.toastNotify(false, 'CEP não encontrado');
                    }
                });
            } else {
                //cep é inválido.
                limpa_formulário_cep();

                utilsJS.toastNotify(false, 'Formato de CEP inválido');
            }
        }else {
            //cep sem valor, limpa formulário.
            limpa_formulário_cep();
        }
        //});
    });
}        