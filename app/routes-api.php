<?php

use App\Middleware\Authentication;
use App\Middleware\Authorization;

$app->group('/api', function () use ($app) {

	$container = $app->getContainer();

	//SECTION AUTH
	$app->group('/auth', function () use ($app) {
		$app->post('/login', 'App\Controller\LoginController:apiLogin')->setName('api-login');
        $app->post('/logout', 'App\Controller\LoginController:apiLogoff')->setName('api-logoff');
	});

	//CONTA
	$app->group('/conta', function () use ($app, $container) {
		$app->post('/persist', 'App\Controller\ContaController:persist')->setArgument('permission', 'ic_insert_contas');
		$app->delete('/delete', 'App\Controller\ContaController:delete')->setArgument('permission', 'ic_delete_contas');
		$app->get('/datatables', 'App\Controller\ContaController:datatables');
	})->add(new Authorization($container))
	->add(new Authentication($container));
	//PERFIL
	$app->group('/perfil', function () use ($app, $container) {
		$app->post('/persist', 'App\Controller\PerfilController:persist')->setArgument('permission', 'ic_insert_perfil-de-acesso');
		$app->delete('/delete', 'App\Controller\PerfilController:delete')->setArgument('permission', 'ic_delete_perfil-de-acesso');
		$app->get('/datatables', 'App\Controller\PerfilController:datatables');
	})->add(new Authorization($container))
	->add(new Authentication($container));
	//USUARIO
	$app->group('/usuario', function () use ($app, $container) {
		$app->post('/persist', 'App\Controller\UsuarioController:persist')->setArgument('permission', 'ic_insert_usuarios');
		$app->delete('/delete', 'App\Controller\UsuarioController:delete')->setArgument('permission', 'ic_delete_usuarios');
		$app->get('/datatables', 'App\Controller\UsuarioController:datatables');
	})->add(new Authorization($container))
	->add(new Authentication($container));

});

