<?php

namespace App\Utils;

class Json {

	public static function run($status, $data = null, $message = null) {
		$return = (Object)[
			'status' => $status
		];

		if ($message !== null) $return->message = $message;

		if ($data !== null) $return->data = $data;

		echo json_encode($return, JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK | JSON_UNESCAPED_UNICODE);
	}

	public static function success($data) {
		return self::run(true, $data);
	}

	public static function error($data, $message = null) {
		return self::run(false, $data, $message);
	}
}