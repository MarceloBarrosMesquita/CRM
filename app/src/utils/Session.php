<?php

namespace App\Utils;

class Session {

	public static function setSession($key, $value) {
		if (!$key && !$value) return false;

		if (!isset($_SESSION)) session_start();

		$_SESSION[$key] = $value;
		return true;
	}

	public static function getSession($key) {
		if (isset($_SESSION[$key])) {
			return $_SESSION[$key];
		}
		return false;
	}

	public static function checkSession($key) {
		if (!isset($_SESSION)) {
			session_start();
		}
		if (!isset($_SESSION[$key])) return false;
		return true;
	}

	public static function cleanSession() {
		if (session_status() !== PHP_SESSION_ACTIVE) {
			@session_start();
		}
		//@session_regenerate_id(true);
		@session_unset();
		@session_destroy();
		@session_write_close();
	}
}
