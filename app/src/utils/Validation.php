<?php

namespace App\Utils;

class Validation{
    private static $return;
    private static $status;
    private static $error = 'O campo "{{field}}" não está preenchido corretamente.';

    public static function validaCPF($cpf) {

        // Extrai somente os números
        $cpf = preg_replace( '/[^0-9]/is', '', $cpf );

        // Verifica se foi informado todos os digitos corretamente
        if (strlen($cpf) != 11) {
            return false;
        }

        // Verifica se foi informada uma sequência de digitos repetidos. Ex: 111.111.111-11
        if (preg_match('/(\d)\1{10}/', $cpf)) {
            return false;
        }

        // Faz o calculo para validar o CPF
        for ($t = 9; $t < 11; $t++) {
            for ($d = 0, $c = 0; $c < $t; $c++) {
                $d += $cpf[$c] * (($t + 1) - $c);
            }
            $d = ((10 * $d) % 11) % 10;
            if ($cpf[$c] != $d) {
                return false;
            }
        }
        return true;

    }

    public static function validaCnpj($cnpj){
        $cnpj = preg_replace('/[^0-9]/', '', (string) $cnpj);

        // Valida tamanho
        if (strlen($cnpj) != 14)
            return false;

        // Verifica se todos os digitos são iguais
        if (preg_match('/(\d)\1{13}/', $cnpj))
            return false;

        // Valida primeiro dígito verificador
        for ($i = 0, $j = 5, $soma = 0; $i < 12; $i++)
        {
            $soma += $cnpj[$i] * $j;
            $j = ($j == 2) ? 9 : $j - 1;
        }

        $resto = $soma % 11;

        if ($cnpj[12] != ($resto < 2 ? 0 : 11 - $resto))
            return false;

        // Valida segundo dígito verificador
        for ($i = 0, $j = 6, $soma = 0; $i < 13; $i++)
        {
            $soma += $cnpj[$i] * $j;
            $j = ($j == 2) ? 9 : $j - 1;
        }

        $resto = $soma % 11;

        return $cnpj[13] == ($resto < 2 ? 0 : 11 - $resto);
    }

    public static function check($campos = array())
    {
        self::$return = array();
        self::$status = true;
        foreach ($campos as $key => $value){
            $value = (Object)$value;
            if (!isset($value->required)){
                $value->required = true;
            }
            if (!isset($value->value)){
                $value->value = '';
            }
            if (!isset($value->email)){
                $value->email = false;
            }
            if (!isset($value->name)){
                $value->name = false;
            }
            if (!isset($value->code)){
                $value->code = -9;
            }
            if (!isset($value->integer)){
                $value->integer = false;
            }
            if (!isset($value->min)){
                $value->min = false;
            }
            if (!isset($value->max)){
                $value->max = false;
            }
            if (!isset($value->minlen)){
                $value->minlen = false;
            }
            if (!isset($value->maxlen)){
                $value->maxlen = false;
            }
            if (!isset($value->length)){
                $value->length = false;
            }
            if (!isset($value->cpf)){
                $value->cpf = false;
            }
            if (!isset($value->date)){
                $value->date = false;
            }
            if (!isset($value->birth)){
                $value->birth = false;
            }
            if (!isset($value->age)){
                $value->age = false;
            }
            if (!isset($value->phone)){
                $value->phone = false;
            }
            if (!isset($value->password)){
                $value->password = false;
            }
            if (!isset($value->in)){
                $value->in = false;
            }
            if (!isset($value->confirm)){
                $value->confirm = false;
            }

            if (isset($value->byPass)){
                if ($value->byPass){
                    continue;
                }
            }

            if (strlen($value->value) < 1 && $value->required !== false){
                self::error($key, $value, 'required', $value->code);
                continue;
            } elseif ($value->required || strlen($value->value) > 0){

                if ($value->email){
                    if (!filter_var($value->value, FILTER_VALIDATE_EMAIL)){
                        self::error($key, $value, 'email', $value->code);
                        continue;
                    }
                }

                if ($value->integer !== false){
                    $options = array();
                    $options['flags'] = FILTER_FLAG_ALLOW_OCTAL;
                    $options['options'] = array();
                    if ($value->min !== false){
                        $options['options']['min_range'] = $value->min;
                    }
                    if ($value->max !== false){
                        $options['options']['max_range'] = $value->max;
                    }
                    if (!filter_var($value->value, FILTER_VALIDATE_INT, $options)){
                        self::error($key, $value, 'integer', $value->code);
                        continue;
                    }
                }

                if ($value->minlen !== false){
                    if (strlen($value->value) < $value->minlen){
                        self::error($key, $value, 'minlen', $value->code);
                        continue;
                    }
                }

                if ($value->maxlen !== false){
                    if (strlen($value->value) > $value->maxlen){
                        self::error($key, $value, 'maxlen', $value->code);
                        continue;
                    }
                }

                if ($value->length !== false){
                    if (strlen($value->value) != $value->length){
                        self::error($key, $value, 'length', $value->code);
                        continue;
                    }
                }

                if ($value->name !== false){
                    if (!preg_match('/^[A-Za-z\'\s]+$/', $value->value)){
                        self::error($key, $value, 'name', $value->code);
                        continue;
                    }
                }


                if ($value->date !== false || $value->birth !== false){
                    list($dia, $mes, $ano) = explode('/', $value->value);
                    if (!checkdate($mes, $dia, $ano)){
                        self::error($key, $value, 'date', $value->code);
                        continue;
                    }
                    if ($value->birth !== false){
                        $ts = date_parse_from_format('d-m-Y', "$dia-$mes-$ano");
                        $ts = mktime('01', null, null, $ts['month'], $ts['day'], $ts['year']);
                        if ($ts > time()){
                            self::error($key, $value, 'birth', $value->code);
                            continue;
                        } elseif ($value->age !== false){
                            $birth = strtotime('-' . $value->age . ' years', time());
                            if ($ts >= $birth){
                                self::error($key, $value, 'birth', $value->code);
                                continue;
                            }
                        }
                    }
                }

                if ($value->phone !== false){
                    $value->value = preg_replace('/[^0-9]/', '', $value->value);
                    $invalidos = ['00000000', '11111111', '22222222', '33333333', '44444444', '55555555', '66666666', '77777777', '88888888', '99999999'];
                    if ((strlen($value->value) <> 8 && strlen($value->value) <> 9) || in_array(mb_substr($value->value, 0, 8), $invalidos)){
                        self::error($key, $value, 'phone', $value->code);
                        continue;
                    }
                }

                if ($value->password !== false){
                    if (strpos($value->value, ' ') !== false){
                        self::error($key, $value, 'password', $value->code);
                        continue;
                    }
                }

                if ($value->confirm !== false){
                    if ($value->value !== $value->confirm){
                        self::error($key, $value, 'confirm', $value->code);
                        continue;
                    }
                }

                if ($value->in !== false){
                    if (!in_array($value->value, $value->in)){
                        self::error($key, $value, 'in', $value->code);
                        continue;
                    }
                }

            }
        }
        return array('status' => self::$status, 'messages' => self::$return);
    }

    private static function error($field, $obj, $type, $code)
    {
        self::$status = false;
        self::$return[] = (Object)['type' => $type, 'message' => ((!empty($obj->error)) ? $obj->error : str_replace('{{field}}', $field, self::$error)), 'code' => $code];
    }

    public static function formatar_cpf_cnpj($doc) {

        $doc = preg_replace("/[^0-9]/", "", $doc);
        $qtd = strlen($doc);

        if($qtd >= 11) {

            if($qtd === 11 ) {

                $docFormatado = substr($doc, 0, 3) . '.' .
                    substr($doc, 3, 3) . '.' .
                    substr($doc, 6, 3) . '.' .
                    substr($doc, 9, 2);
            } else {
                $docFormatado = substr($doc, 0, 2) . '.' .
                    substr($doc, 2, 3) . '.' .
                    substr($doc, 5, 3) . '/' .
                    substr($doc, 8, 4) . '-' .
                    substr($doc, -2);
            }

            return $docFormatado;

        } else {
            return 'Documento invalido';
        }
    }
}