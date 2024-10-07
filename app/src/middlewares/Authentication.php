<?php

namespace App\Middleware;
use App\Utils\Session;
use App\Model\Conta;
use Psr\Http\Message\ServerRequestInterface;
use Slim\Http\Response;

class Authentication extends BaseMiddleware
{

    public function __invoke(ServerRequestInterface $requestInterface, Response $responseInterface, callable $next)
    {
        $user = (object)$_SESSION['session_user'] ?? null;
        if (!empty($user->id) && !empty($user->id_perfil)) {
            if (empty($user)) {
                return $responseInterface->withRedirect('/login');
            }
            else{
                return $next($requestInterface, $responseInterface);
            }
        } else {
            return $responseInterface->withRedirect('/login');
        }
    }
}
