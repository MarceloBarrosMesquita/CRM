jQuery.validator.addMethod("checkCPF", function (value, element) {
    value = value.replace(".", "");
    value = value.replace(".", "");
    cpf = value.replace("-", "");
    while (cpf.length < 11) cpf = "0" + cpf;
    var expReg = /^0+$|^1+$|^2+$|^3+$|^4+$|^5+$|^6+$|^7+$|^8+$|^9+$/;
    var a = [];
    var b = new Number;
    var c = 11;
    for (i = 0; i < 11; i++) {
        a[i] = cpf.charAt(i);
        if (i < 9) b += a[i] * --c
    }
    if ((x = b % 11) < 2) {
        a[9] = 0
    } else {
        a[9] = 11 - x
    }
    b = 0;
    c = 11;
    for (y = 0; y < 10; y++) b += a[y] * c--;
    if ((x = b % 11) < 2) {
        a[10] = 0
    } else {
        a[10] = 11 - x
    }
    if (cpf.charAt(9) != a[9] || cpf.charAt(10) != a[10] || cpf.match(expReg)) return false;
    return true
}, "Informe um CPF válido.");

jQuery.validator.addMethod("minold", function (value, element, requiredValue) {
    if (value.length != 0) {
        if (value.length != 10) {
            return false
        }
        var now = moment(new Date);
        var end = moment(value, "DD-MM-YYYY");
        var duration = moment.duration(now.diff(end));
        var years = parseInt(duration.asYears());
        if (years < requiredValue || years > 110) {
            return false
        }
    }
    return true
}, "Informe a data de nascimento corretamente");

jQuery.validator.addMethod("checkCNPJ", function (cnpj, element) {
    cnpj = jQuery.trim(cnpj);
    cnpj = cnpj.replace("/", "");
    cnpj = cnpj.replace(".", "");
    cnpj = cnpj.replace(".", "");
    cnpj = cnpj.replace("-", "");
    var numeros, digitos, soma, i, resultado, pos, tamanho, digitos_iguais;
    digitos_iguais = 1;
    if (cnpj.length < 14 && cnpj.length < 15) {
        return this.optional(element) || false
    }
    for (i = 0; i < cnpj.length - 1; i++) {
        if (cnpj.charAt(i) != cnpj.charAt(i + 1)) {
            digitos_iguais = 0;
            break
        }
    }
    if (!digitos_iguais) {
        tamanho = cnpj.length - 2;
        numeros = cnpj.substring(0, tamanho);
        digitos = cnpj.substring(tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) {
                pos = 9
            }
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0)) {
            return this.optional(element) || false
        }
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) {
                pos = 9
            }
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1)) {
            return this.optional(element) || false
        }
        return this.optional(element) || true
    } else {
        return this.optional(element) || false
    }
}, "Informe um CNPJ válido.");

jQuery.validator.addMethod("strengthPassword", function (password, element) {
    return oauthJS.checkPassword(password);
}, "Informa uma senha forte.");
