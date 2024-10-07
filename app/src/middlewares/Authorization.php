<?php

namespace App\Middleware;
use App\Utils\Session;
use App\Model\Perfil;
use Psr\Http\Message\ServerRequestInterface;
use Slim\Http\Response;

class Authorization extends BaseMiddleware
{

    public function __invoke(ServerRequestInterface $request, Response $responseInterface, callable $next)
    {
        $user = (object)$_SESSION['session_user'] ?? null;
        $route = ($request->getAttribute('route'))->getArguments();
        $method = strtoupper((($request->getAttribute('route'))->getMethods())[0]);
        $role = (new Perfil($this->pdo))->getById($user->id_perfil);
        if (!empty($role->permissoes)) {
            
            // Se 'permissoes' for uma string JSON, decodifique-a
            $role->permissoes = json_decode($role->permissoes, true);
            
            // Inicializa o array de permissões
            $permissionsUser = [];

            // Percorre as permissões e armazena no array de permissões
            foreach ($role->permissoes as $resource => $privileges) {
                foreach ($privileges as $privilege) {
                    $permissionsUser[] = $privilege;
                }
            }
            if (!empty($route['permission'])) {
                $permissionsRoute = explode('.', $route['permission']);
                
                if (!in_array($permissionsRoute[0], $permissionsUser)) {
                    if ($method == 'GET') {
                        $this->view->render($responseInterface, '/theme/acesso-restrito.twig', array(
                            'title'       => 'Acesso restrito!',
                            'description' => 'Você não tem permissão para acessar essa área da plataforma',
                        ));
                    } 
                    else {
                        return $responseInterface->withJson((object)[
                            'status'  => false,
                            'message' => 'Você não tem permissão para acessar esse recurso da plataforma.'
                        ], 403);
                    }
                    return $responseInterface->withStatus(403);
                }
            }
        }
        return $next($request, $responseInterface);
    }
}
