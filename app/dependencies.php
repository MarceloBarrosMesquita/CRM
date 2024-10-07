<?php

use App\Model\Perfil;
use Slim\Views\TwigExtension;

// DIC configuration
    $container = $app->getContainer();

// Twig
   


    // PDO database library
    $container['pdo'] = function ($c) {
        try {
            $pdo_config = $c->get('settings')['db'];
            $db = new \PDO("mysql:host=" . $pdo_config['host'] . ";dbname=" . $pdo_config['dbname'], $pdo_config['user'], $pdo_config['password'], array(
                \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION, \PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"
            ));
            return $db;
        } catch (\PDOException $e) {
            echo($e->getMessage());
        }
    };


    $container['view'] = function ($c) {

        $settings = $c->get('settings');
        $view = new \Slim\Views\Twig($settings['view']['template_path'], $settings['view']['twig']);

        // Add extensions
        $view->addExtension(new TwigExtension($c->get('router'), $c->get('request')->getUri()));
        $view->addExtension(new \Twig_Extension_Debug());

        //Function to encrypt in Base64Encode
        $twigBase64Encode = new Twig_SimpleFilter('base64_encode', function ($valor) {
            return base64_encode($valor);
        });

        //Function to decrypt in AES
        $twigFileExists = new Twig_SimpleFilter ('twig_file_exists', function ($valor) {
            return file_exists(PATH . $valor);
        });



        $permissions = [];
        if (!empty($_SESSION['session_user'])) {
            $role = (new Perfil($c->pdo))->getById($_SESSION['session_user']['id_perfil']);
            if (!empty($role->permissoes)) {
                // Se 'permissoes' for uma string JSON, decodifique-a
                $role->permissoes = json_decode($role->permissoes, true);
    
                foreach ($role->permissoes as $resource => $privileges) {
                    foreach ($privileges as $privilege) {
                        $permissions[] = $privilege;
                    }
                }
            }
        }
        
        $view->getEnvironment()->addGlobal('permissions', $permissions);
        $view->getEnvironment()->addGlobal('session', $_SESSION);
        $view->getEnvironment()->addGlobal('settingsGlobal', $c->settings['data']);
        $view->getEnvironment()->addFilter($twigBase64Encode);
        $view->getEnvironment()->addFilter($twigFileExists);

        return $view;
    };
    // PDO database library

    $container['settings_data'] = function ($c) {
        $settings = $c->get('settings');
        return $settings['data'];
    };

    $container['notFoundHandler'] = function ($container) {
        return function ($request, $response) use ($container) {
            return $container['view']->render($response->withStatus(404), 'theme/404.twig');
        };
    };
