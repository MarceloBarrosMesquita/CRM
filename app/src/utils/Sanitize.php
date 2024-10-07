<?php

namespace App\Utils;

class Sanitize {

	public static function paranoid_string($string, $min = '', $max = '') {
		$string = preg_replace("/[^a-zA-Z0-9]/", "", $string);
		$len = strlen($string);
		if ((($min != '') && ($len < $min)) || (($max != '') && ($len > $max))) return FALSE;
		return $string;
	}

	public static function int($integer, $min = '', $max = '') {
		$int = intval($integer);
		if ((($min != '') && ($int < $min)) || (($max != '') && ($int > $max))) return FALSE;
		return $int;
	}


	public static function float($float, $min = '', $max = '') {
		$float = floatval($float);
		if ((($min != '') && ($float < $min)) || (($max != '') && ($float > $max))) return FALSE;
		return $float;
	}

	public static function html_string($string) {
		$pattern[0] = '/\&/';
		$pattern[1] = '/</';
		$pattern[2] = "/>/";
		$pattern[3] = '/\n/';
		$pattern[4] = '/"/';
		$pattern[5] = "/'/";
		$pattern[6] = "/%/";
		$pattern[7] = '/\(/';
		$pattern[8] = '/\)/';
		$pattern[9] = '/\+/';
		$pattern[10] = '/-/';
		$replacement[0] = '&amp;';
		$replacement[1] = '&lt;';
		$replacement[2] = '&gt;';
		$replacement[3] = '<br>';
		$replacement[4] = '&quot;';
		$replacement[5] = '&#39;';
		$replacement[6] = '&#37;';
		$replacement[7] = '&#40;';
		$replacement[8] = '&#41;';
		$replacement[9] = '&#43;';
		$replacement[10] = '&#45;';
		return preg_replace($pattern, $replacement, $string);
	}

	public static function sql_string($string, $min = '', $max = '') {
		$string = nice_addslashes($string); //gz
		$pattern = "/;/"; // jp
		$replacement = "";
		$len = strlen($string);
		if ((($min != '') && ($len < $min)) || (($max != '') && ($len > $max))) return FALSE;
		return preg_replace($pattern, $replacement, $string);
	}

	public static function ldap_string($string, $min = '', $max = '') {
		$pattern = '/(\)|\(|\||&)/';
		$len = strlen($string);
		if ((($min != '') && ($len < $min)) || (($max != '') && ($len > $max))) return FALSE;
		return preg_replace($pattern, '', $string);
	}

	public static function removeAcentos($string) {
		return preg_replace(array(
			"/(á|à|ã|â|ä)/",
			"/(Á|À|Ã|Â|Ä)/",
			"/(é|è|ê|ë)/",
			"/(É|È|Ê|Ë)/",
			"/(í|ì|î|ï)/",
			"/(Í|Ì|Î|Ï)/",
			"/(ó|ò|õ|ô|ö)/",
			"/(Ó|Ò|Õ|Ô|Ö)/",
			"/(ú|ù|û|ü)/",
			"/(Ú|Ù|Û|Ü)/",
			"/(ñ)/",
			"/(Ñ)/",
			"/(ç)/",
			"/(Ç)/",
		), explode(" ", "a A e E i I o O u U n N c C"), $string);
	}

	public static function removeAcentosForFiles($string) {
		return preg_replace(array(
			"/(á|à|ã|â|ä)/",
			"/(Á|À|Ã|Â|Ä)/",
			"/(é|è|ê|ë)/",
			"/(É|È|Ê|Ë)/",
			"/(í|ì|î|ï)/",
			"/(Í|Ì|Î|Ï)/",
			"/(ó|ò|õ|ô|ö)/",
			"/(Ó|Ò|Õ|Ô|Ö)/",
			"/(ú|ù|û|ü)/",
			"/(Ú|Ù|Û|Ü)/",
			"/(ñ)/",
			"/(Ñ)/",
			"/(ç)/",
			"/(Ç)/",
			"/(')/",
			"/(:)/",
			"/( )/",
		), explode(" ", "a A e E i I o O u U n N c C _ _ _"), $string);
	}

}