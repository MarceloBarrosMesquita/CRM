<?php

namespace App\Utils;
use stdClass;
use Tebru\AesEncryption\AesEncrypter;
use Throwable;

class Util {

    public static function slugify(string $text, string $divider = '-'): string {
        // replace non letter or digits by divider
        $text = preg_replace('~[^\pL\d]+~u', $divider, $text);

        // transliterate
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);

        // remove unwanted characters
        $text = preg_replace('~[^\-\\w]+~', '', $text); // Corrigido para usar ~ como delimitador

        // trim
        $text = trim($text, $divider);

        // remove duplicate divider
        $text = preg_replace('~-+~', $divider, $text); // Corrigido para usar ~ como delimitador

        // lowercase
        $text = strtolower($text);

        if (empty($text)) {
            return 'n-a';
        }

        return $text;

    }
    public static function slugifyArray(array $strings): array {
            try {
                $divider = '_';
                foreach ($strings as $key => $string) {
                    $string = preg_replace('~[^\pL\d]+~u', $divider, $string);
                    $string = iconv('utf-8', 'us-ascii//TRANSLIT', $string);
                    $string = preg_replace('[^-\w]+', '', $string);
                    $string = trim($string, $divider);
                    $string = preg_replace('-+', $divider, $string);
                    $strings[$key] = strtolower($string);
                }
                return $strings;
            } catch (Throwable $th) {
                return [];
            }
        }
    public static function sanitizeArray($records): array {
            $aux = [];
            foreach ($records as $offset => $record) {
                if ($offset === 0) {
                    $header = self::slugifyArray($record);
                }
                $aux[] = $record;
            }

            array_walk($aux, function (&$a) use ($header) {
                if (count($header) === count($a)) {
                    $a = array_combine($header, $a);
                }
            });

            array_shift($aux);
            return $aux;
        }

    public static function trimRecursive(stdClass $target): stdClass {
        $target = (array)$target;
        array_walk_recursive($target, function (&$item) {
            $item = trim($item);
        });

        return (object)$target;
    }

    /**
     * Apply striptags in object recursively
     * @param stdClass $target target
     * @return stdClass
     */
    public static function stripTagsRecursive(stdClass $target): stdClass {
        $target = (array)$target;
        array_walk_recursive($target, function (&$item) {
            $item = strip_tags($item);
        });
        return (object)$target;
    }
	public static function trimInArray(Array $itens) {
		array_walk_recursive($itens, function (&$item, $key) {
			$item = trim($item);
		});
		return $itens;
	}

	public static function addslashesInArray(Array $itens) {
		array_walk_recursive($itens, function (&$item, $key) {
			$item = addslashes($item);
		});
		return $itens;
	}
    public static function removerAcentos($texto) {
        $acentos = array('á','à','ã','â','é','è','ê','í','ì','ó','ò','õ','ô','ú','ù','ç','Á','À','Ã','Â','É','È','Ê','Í','Ì','Ó','Ò','Õ','Ô','Ú','Ù','Ç',' ');
        $sem_acentos = array('a','a','a','a','e','e','e','i','i','o','o','o','o','u','u','c','A','A','A','A','E','E','E','I','I','O','O','O','O','U','U','C','');
        return str_replace($acentos, $sem_acentos, $texto);
    }

	public static function redirect($url) {
		foreach (headers_list() as $h) {
			$h = explode(':', $h);
			if (strcasecmp(trim($h[0]), 'Location') === 0) {
				return false;
			}
		}
		ob_clean();
		header('Location: ' . $url);
		exit(0);
	}

	public static function soNumeros($numero) {
		return preg_replace("/[^0-9]/", "", $numero);
	}

    public static function postCurl($dados) {
        $ch = curl_init($dados->url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $dados->data);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type:application/json',
            'Content-Length: ' . strlen($dados->data)
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $dados->data);

        $retorno = curl_exec($ch);
        curl_close($ch);
        $result = json_decode($retorno);
        return $result;
    }

    public static function postCurlToken($dados,$token) {
        $ch = curl_init($dados->url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $dados->data);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type:application/json',
            'Authorization: Bearer ' . $token,
            'Content-Length: ' . strlen($dados->data)
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $dados->data);

        $retorno = curl_exec($ch);
        curl_close($ch);
        $result = json_decode($retorno);
        return $result;
    }

    public static function deleteCurlToken($dados,$token) {
        $ch = curl_init($dados->url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $dados->data);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type:application/json',
            'Authorization: Bearer ' . $token,
            'Content-Length: ' . strlen($dados->data)
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $dados->data);

        $retorno = curl_exec($ch);
        curl_close($ch);
        $result = json_decode($retorno);
        return $result;
    }

    public static function putCurlToken($dados,$token) {
        $ch = curl_init($dados->url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $dados->data);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type:application/json',
            'Authorization: Bearer ' . $token,
            'Content-Length: ' . strlen($dados->data)
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $dados->data);

        $retorno = curl_exec($ch);
        curl_close($ch);
        $result = json_decode($retorno);
        return $result;
    }

    public static function getCurl($url) {
        $c = curl_init();
        curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($c, CURLOPT_BINARYTRANSFER, true);
        curl_setopt($c, CURLOPT_TIMEOUT, 30);
        curl_setopt($c, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($c, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($c, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($c, CURLOPT_HEADER, false);
        curl_setopt($c, CURLOPT_FOLLOWLOCATION, false);
        curl_setopt($c, CURLOPT_MAXREDIRS, 0);
        curl_setopt($c, CURLOPT_AUTOREFERER, false);
        curl_setopt($c, CURLOPT_FORBID_REUSE, false);
        curl_setopt($c, CURLOPT_FRESH_CONNECT, false);
        curl_setopt($c, CURLOPT_ENCODING, '');
        curl_setopt($c, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($c, CURLOPT_URL, str_replace(' ', '%20', $url));
        curl_setopt($c, CURLOPT_HTTPHEADER, array('Expect:'));
        //curl_setopt($c, CURLOPT_POST, true);
        //curl_setopt($c, CURLOPT_POSTFIELDS, '');
        curl_setopt($c, CURLOPT_VERBOSE, true);
        curl_setopt($c, CURLOPT_HEADER, false);
        curl_setopt($c, CURLINFO_HEADER_OUT, false);

        $retorno = curl_exec($c);
        curl_close($c);
        $result = json_decode($retorno);

        return $result;
    }

    public static function getCurlTeste($url) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type:application/json',
        ]);

        $retorno = curl_exec($ch);
        curl_close($ch);
        $result = json_decode($retorno);

        return $result;
    }

    public static function curl($url) {
        $c = curl_init();
        curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($c, CURLOPT_BINARYTRANSFER, true);
        curl_setopt($c, CURLOPT_TIMEOUT, 30);
        curl_setopt($c, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($c, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($c, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($c, CURLOPT_HEADER, false);
        curl_setopt($c, CURLOPT_FOLLOWLOCATION, false);
        curl_setopt($c, CURLOPT_MAXREDIRS, 0);
        curl_setopt($c, CURLOPT_AUTOREFERER, false);
        curl_setopt($c, CURLOPT_FORBID_REUSE, false);
        curl_setopt($c, CURLOPT_FRESH_CONNECT, false);
        curl_setopt($c, CURLOPT_ENCODING, '');
        curl_setopt($c, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($c, CURLOPT_URL, str_replace(' ', '%20', $url));
        curl_setopt($c, CURLOPT_HTTPHEADER, array('Expect:'));
        //curl_setopt($c, CURLOPT_POST, true);
        //curl_setopt($c, CURLOPT_POSTFIELDS, '');
        curl_setopt($c, CURLOPT_VERBOSE, true);
        curl_setopt($c, CURLOPT_HEADER, false);
        curl_setopt($c, CURLINFO_HEADER_OUT, false);

        $retorno = curl_exec($c);
        curl_close($c);
        $result = json_decode($retorno);

        return $result;
    }

    public static function mysqlnull($value){

        $pattern = '/\d+/';
        if($value == 'Null')
            return $value;
        if($value == 'null')
            return $value;
        elseif(is_null($value))
            return "null";
        elseif(trim($value) == "")
            return "null";
        elseif($value=="sysdate()")
            return $value;
        elseif(!is_numeric($value))
            return "'" . ($value) . "'";
        elseif(is_numeric($value))
            return ($value);
        else
            return "'" . ($value) . "'";
    }

    public static function execInsert($table, $fields,$bd){
        if(empty($table)) return null;

        if(!is_array($fields)) return null;
                
        
        $into = array();
        $values = array();
        foreach($fields as $field => $value){
            $value = (!is_null($value) && empty($value) && $value != 0?'null':$value);
            $into[] = $field;
            $values[] = Util::mysqlnull($value);
        }
        $into = implode(", ", $into);

        $values = implode(", ", $values);

        $sql = "Insert Into $table ($into) Values (" . $values . ")";
       

        $stmt = $bd->prepare( $sql );
        $stmt->execute();

        return $bd->lastInsertId();
    }

    public static function execDelete($table, $where,$bd){
        $sql = "delete from $table where ".$where;


        $stmt = $bd->prepare( $sql );
      
        $stmt->execute();
        
        return 1;
    }

    public static function execUpdate($table, $fields, $where,$bd){

        if(empty($table)) return null;
        if(!is_array($fields)) return null;
        $set = array();
        $into = array();
        foreach($fields as $field => $value){
            $value = (!is_null($value) && empty($value) && $value != 0?'null':$value);
            $campos[] = $field;
            $into[] = $field;
            if(!empty($value) || $value == '0')
                $set[] = "$field = " . Util::mysqlnull($value);
        }
        if(empty($set)) return null;

        $into = implode(",", $into);
        $campos = implode(",", $campos);
        $sql = "Update $table Set ". implode(", ", $set);

        if(!empty($where)){
            $sql .= " Where $where";
        }
       

        $stmt = $bd->prepare( $sql );
        $stmt->execute();
    }
    public static function DataYMD($strData){

        list($day, $month, $year) = explode('/', $strData);
        return "".$year."-".$month."-".$day."";
    }
    public static function DataDMY($strData){
        list($year, $month, $day) = explode('-', $strData);
        return "'".$day."/".$month."/".$year."'";
    }
    public static function minuto2Hora($minutos){
        $hora = floor($minutos/60);
        $resto = $minutos%60;
        return $hora.':'.$resto;

    }

    public static function converterHoraPMinuto($hora_inicial) {

        $i = 1;


        $tempos = array($hora_inicial, $hora_inicial);

        foreach($tempos as $tempo) {
            $segundos = 0;

            list($h, $m, $s) = explode(':', $tempo);

            $segundos += $h * 3600;
            $segundos += $m * 60;
            $segundos += $s;

            $i++;
        }

        return $segundos;
    }

    public static function calculaTempo($hora_inicial, $hora_final) {
        $i = 1;
        $tempo_total = [];


        $tempos = array($hora_final, $hora_inicial);

        foreach($tempos as $tempo) {
            $segundos = 0;

            list($h, $m, $s) = explode(':', $tempo);

            $segundos += $h * 3600;
            $segundos += $m * 60;
            $segundos += $s;

            $tempo_total[$i] = $segundos;

            $i++;
        }
        $segundos = $tempo_total[1] - $tempo_total[2];

        $horas = floor($segundos / 3600);
        $segundos -= $horas * 3600;
        $minutos = str_pad((floor($segundos / 60)), 2, '0', STR_PAD_LEFT);
        $segundos -= $minutos * 60;
        $segundos = str_pad($segundos, 2, '0', STR_PAD_LEFT);

        return "$horas:$minutos:$segundos";
    }

    public static function diffBetweenDates( $date1,  $date2, string $type = 'seconds'): int {
        //EXEMPLO DE USO
        /*$date1 = date_create_from_format('d/m/Y H:i:s', ($_POST['dt_recebimento_atestado']." 00:00:00"));
        $date2 = date_create_from_format('d/m/Y H:i:s',  date('d/m/Y H:i:s'));*/


        $diff_seconds = $date1->getTimestamp() - $date2->getTimestamp();

        switch ($type) {
            case 'seconds':
                $diff = ($diff_seconds > 0) ? $diff_seconds : $diff_seconds * -1;
                break;
            case 'minutes':
                $diff = round((($diff_seconds > 0) ? $diff_seconds : $diff_seconds * -1) / 60);
                break;
            case 'hours':
                $diff = round((($diff_seconds > 0) ? $diff_seconds : $diff_seconds * -1) / (60 * 60));
                break;
            case 'days':
                $diff = round((($diff_seconds > 0) ? $diff_seconds : $diff_seconds * -1) / (60 * 60 * 24));
                break;
            default:
                $diff = ($diff_seconds > 0) ? $diff_seconds : $diff_seconds * -1;
        }

        return $diff;

    }

    public static function fcTransformarCoordenadasEmEndereco($lat,$lon){
        $geo= array();


        // Daqui em diante é o seu código original
        $geocode = file_get_contents('https://maps.googleapis.com/maps/api/geocode/json?latlng='.$lat.','.$lon.'&key=AIzaSyDPW_otpl6OaPuRTTnrLUP0-NiKm1Pb6OA');

        $output = json_decode($geocode);


        $endereco_completo = $output->results[1]->address_components[1]->long_name.",".$output->results[1]->address_components[2]->long_name." - ".$output->results[1]->address_components[3]->long_name;

        $geo['endereco'] = $endereco_completo;

        //return ($geo['endereco']);
        return "";
    }
    public static function fcTransformarEnderecoEmCoordenadas($endereco){
        $addr = str_replace(" ", "+", $endereco); // Substitui os espaços por + "Rua+Paulo+Guimarães,+São+Paulo+-+SP" conforme padrão 'maps.google.com'
        $address = utf8_encode($addr); // Codifica para UTF-8 para não dar 'pau' no envio do parâmetro


        $geocode = file_get_contents('https://maps.googleapis.com/maps/api/geocode/json?address='.$address.'&key=AIzaSyDPW_otpl6OaPuRTTnrLUP0-NiKm1Pb6OA');
        $output = json_decode($geocode);
        $lat = $output->results[0]->geometry->location->lat;
        $long = $output->results[0]->geometry->location->lng;
        $geo['lat'] = $lat;
        $geo['long'] = $long;

        return $geo['lat'].",".$geo['long'];
    }
    public static function fcCalcularDistanciaEntrePontos($lat1, $lon1, $lat2, $lon2) {

        $lat1 = deg2rad($lat1);
        $lat2 = deg2rad($lat2);
        $lon1 = deg2rad($lon1);
        $lon2 = deg2rad($lon2);

        $latD = $lat2 - $lat1;
        $lonD = $lon2 - $lon1;

        $dist = 2 * asin(sqrt(pow(sin($latD / 2), 2) +
                cos($lat1) * cos($lat2) * pow(sin($lonD / 2), 2)));
        $dist = $dist * 6371;
        return number_format($dist, 2, '.', '');
    }

    public static function isBase64($string) {
        // Verificar se o comprimento da string é múltiplo de 4
        if (strlen($string) % 4 !== 0) {
            return false;
        }
        
        // Verificar se a string contém apenas caracteres válidos de Base64
        if (!preg_match('/^[a-zA-Z0-9\/\r\n+]*={0,2}$/', $string)) {
            return false;
        }
        
        // Tentar decodificar a string
        $decoded = base64_decode($string, true);
        
        // Verificar se a decodificação foi bem-sucedida
        if ($decoded === false) {
            return false;
        }
        
        // Verificar se a string codificada e depois decodificada corresponde à string original
        if (base64_encode($decoded) !== $string) {
            return false;
        }
        
        return true;
    }

}