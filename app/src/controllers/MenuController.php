<?php

namespace App\Controller;

use App\Model\Usuario;
use App\Utils\Json;
use App\Utils\Util;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Throwable;

final class MenuController extends BaseController {
    public function principal(Request $request, Response $response, $args){
        try{
            $this->view->render($response, 'menu/principal.twig');

        } catch (Throwable $th) {
            return $response->getBody()->write(json_encode([
                'error' => $th->getMessage(),
            ]));
        }
    }

   
}

