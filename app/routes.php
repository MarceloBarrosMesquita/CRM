<?php

    /** @noinspection PhpParamsInspection */
    /** @noinspection SpellCheckingInspection */
    /** @noinspection PhpUndefinedVariableInspection */

    use App\Middleware\Authentication;
use App\Middleware\Authorization;

    $container = $app->getContainer();


    //new Authentication($container) faz a verificação para ver se tem algum usuário logado.

    //MENU
    $app->get('/', 'App\Controller\LoginController:login')
        ->setName('root')->add(new Authentication($container));
    $app->get('/menu/principal', 'App\Controller\MenuController:principal')
        ->setName('root')->add(new Authentication($container));

    
    //LOGIN
    $app->get('/login', 'App\Controller\LoginController:login')
        ->setName('login');

    $app->group('/usuario', function () use ($app) {
        $app->get('/form[/{id}]', 'App\Controller\UsuarioController:form')->setArgument('permission', 'ic_insert_usuarios');
        $app->get('/list', 'App\Controller\UsuarioController:list')->setArgument('permission', 'ic_listar_usuarios');
    })->add(new Authorization($container))
	->add(new Authentication($container));

    $app->group('/cpainel', function () use ($app) {
        $app->group('/perfil', function () use ($app) {
            $app->get('/form[/{id}]', 'App\Controller\PerfilController:form')->setArgument('permission', 'ic_insert_perfil-de-acesso');
            $app->get('/list', 'App\Controller\PerfilController:list')->setArgument('permission', 'ic_listar_perfil-de-acesso');
        });
        $app->group('/conta', function () use ($app) {
            $app->get('/form[/{id}]', 'App\Controller\ContaController:form')->setArgument('permission', 'ic_insert_contas');
            $app->get('/list', 'App\Controller\ContaController:list')->setArgument('permission', 'ic_listar_contas');
        });
    })->add(new Authorization($container))
	->add(new Authentication($container));


    

    
