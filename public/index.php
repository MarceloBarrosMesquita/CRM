<?php

define('PATH', __DIR__);
define('SALT', '$1$s4YGu.zU$HA.Mcb6q3MumqgGRXiSWh0');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT,GET,POST,DELETE");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

date_default_timezone_set('America/Sao_Paulo');
mb_internal_encoding("UTF-8");

require __DIR__ . '/../vendor/autoload.php';



//Manage session
$noSession = explode('/', $_SERVER['REQUEST_URI']);

if (!empty($noSession[3])) {
	if (strtolower($noSession[3]) == 'set-session') {
		ini_set('session.use_cookies', false);
		ini_set('session.use_only_cookies', true);
		session_start();
		try {
			session_write_close();
		} catch (Exception $e) {
		}
	} else {
		session_start();
	}
} else {
	session_start();
}

header('Expires: Tue, 03 Jul 2001 06:00:00 GMT');
header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

//Instancia APP
$settings = require __DIR__ . '/../app/settings.php';
$app = new \Slim\App($settings);

//Registra middlewares
require __DIR__ . '/../app/middleware.php';

//Init Dependencias
require __DIR__ . '/../app/dependencies.php';

// Registra Rotas
require __DIR__ . '/../app/routes.php';
require __DIR__ . '/../app/routes-api.php';

// Run!
$app->run();