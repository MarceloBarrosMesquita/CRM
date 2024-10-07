<?php

/** @noinspection PhpUnused */
/** @noinspection DuplicatedCode */
/** @noinspection SpellCheckingInspection */
/** @noinspection PhpUnusedParameterInspection */
/** @noinspection PhpArrayUsedOnlyForWriteInspection */
/** @noinspection PhpPossiblePolymorphicInvocationInspection */

namespace App\Controller;

use App\Model\Conta;
use App\Model\Perfil;
use Throwable;
use App\Model\Usuario;
use App\Utils\Util;
use Slim\Http\Request;
use Slim\Http\Response;
use App\Utils\Validation;
use Laminas\Permissions\Acl\Acl;

final class UsuarioController extends BaseController {

    public function form(Request $request, Response $response, array $args): Response {
        try {
            $data = (object)$args;
            $data = Util::trimRecursive($data);
            $data = Util::stripTagsRecursive($data);
           
            if (!empty($data->id) && is_numeric((int)$data->id)) {
                $user = (new Usuario($this->pdo))->getByID((int)$data->id);

                if (empty($user->id)) {
                    $this->view->render($response, '/_global/error.twig', array(
                        'title'       => 'Acesso restrito!',
                        'description' => 'Você não tem permissão para acessar essa área da plataforma',
                    ));
                    return $response;
                }
            }

            $perfil = (new Perfil($this->pdo))->get();
            $conta = (new Conta($this->pdo))->get();
          
            $this->view->render($response, 'usuario/form.twig', [
                'perfil'  => $perfil ?? [],
                'conta'  => $conta ?? [],
                'entity'   => $user ?? null,
            ]);
            return $response;
        } catch (Throwable $th) {
           print_r($th->getMessage());
           die();
            return $response->getBody()->write(json_encode([
                'error' => $th->getMessage()
            ]), 500);
        }
    }

    

    public function list(Request $request, Response $response, array $args): Response {
        try {
            $this->view->render($response, 'usuario/list.twig');
            return $response;
        } catch (Throwable $th) {
           
            return $response->getBody()->write(json_encode([
                'error' => $th->getMessage()
            ]), 500);
        }
    }

    public function persist(Request $request, Response $response, array $args): Response {
        try {
            $data = (object)$request->getParsedBody();
            $data = Util::trimRecursive($data);
            $data = Util::stripTagsRecursive($data);

          
            $entityUser = new Usuario($this->pdo);

            $user = false;

            if (!empty($data->id)) {
                $user = $entityUser->getByID($data->id);
            }

            $user = $entityUser->persist($data);
            if (empty($user)) {
                return $response->getBody()->write(json_encode([
                    'status'  => false,
                    'message' => 'Ocorreu um erro ao criar/atualizar usuário. Contate o suporte.'
                ]), 422);
               
            }
            return $response->withJson((object)[
                'status'  => true,
                'message' => 'Usuário atualizado com sucesso',
                'data'    => ['user' => $user]
            ], 200);

            
        } catch (Throwable $th) {
            return $response->getBody()->write(json_encode([
                'status'  => false,
                'message' => $th->getMessage()
            ]), 500);
        }
    }

    

    public function delete(Request $request, Response $response, array $args): Response {
        try {
            $data = (object)$request->getParsedBody();
            $data = Util::trimRecursive($data);
            $data = Util::stripTagsRecursive($data);

            if (empty($data->id)) {
                
                return $response->withJson((object)[
                    'status'  => false,
                    'message' => 'Identificador do usuário não encontrado'
                ], 422);
            }

            $entity = new Usuario($this->pdo);
            $user = $entity->getByID($data->id);

            if (empty($user->id)) {
                return $response->withJson((object)[
                    'status'  => false,
                    'message' => 'Usuário não encontrado em nosso banco de dados'
                ], 422);
            }

            $delete = $entity->delete($user->id);
            if (empty($delete)) {
                return $response->withJson((object)[
                    'status'  => false,
                    'message' => 'Ocorreu um erro ao excluir usuário'
                ], 422);
            }

            return $response->withJson((object)[
                'status'  => true,
                'message' => 'Usuário excluído com sucesso',
            ], 200);

        } catch (Throwable $th) {
            return $response->withJson((object)[
                'status'  => false,
                'message' => $th->getMessage()
            ], 422);
        }
    }

    public function datatables(Request $request, Response $response, array $args): Response {
        try {
            $data = (object)$request->getQueryParams();
            $data = Util::trimRecursive($data);
            $data = Util::stripTagsRecursive($data);

            $entity = (new Usuario($this->pdo))->datatables($data);
            if (empty($entity)) {
                return $response->withJson((object)[
                    'status'  => false,
                    'message' => 'Ocorreu um erro ao exibir dados'
                ], 422);
            }

            return $response->withJson((object)$entity, 200);
        } catch (Throwable $th) {
            return $response->withJson((object)[
                'error' => $th->getMessage()
            ], 500);
        }
    }
}