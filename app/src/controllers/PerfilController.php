<?php

namespace App\Controller;
use App\Utils\Session;
use App\Model\Perfil;
use App\Utils\Util;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Throwable;
use stdClass;

final class PerfilController extends BaseController {

	public function list(Request $request, Response $response, $args) {
        try{
            $this->view->render($response, 'perfil/list.twig');
            return $response;
        } catch (Throwable $th) {
            return $response->getBody()->write(json_encode([
                'error' => $th->getMessage(),
            ]));
        }
	}

    public function form(Request $request, Response $response, array $args) {
        try {
            $data = (object)$args;
            $data = Util::trimRecursive($data);
            $data = Util::stripTagsRecursive($data);

            $perfil = false;
            $entityPerfil = new Perfil($this->pdo);

            if (!empty($data->id)) {
                $perfil = $entityPerfil->getById($data->id);
                // Verifica se a propriedade 'permissao' existe e não é vazia
                if (!empty($perfil->permissoes)) {
                    // Transforma a string JSON de permissões em um array associativo
                    $perfil->permissoes = json_decode($perfil->permissoes, true); // O segundo parâmetro true faz retornar um array associativo
                } else {
                    // Se não houver permissões, inicializa como um array vazio
                    $perfil->permissoes = [];
                }
            }
            $modulos = $entityPerfil->getModulos();
            
            $this->view->render($response, 'perfil/form.twig', array(
                'entity'           => $perfil,
                'modulos'        => $modulos
            ));
            return $response;
        } catch (Throwable $th) {
            
            return $response->getBody()->write(json_encode([
                'error' => $th->getMessage(),
            ]));
        }
    }

    public function persist(Request $request, Response $response, array $args) {
        try {
            $data = (object)$request->getParsedBody();
            $data = Util::trimRecursive($data);
            $data = Util::stripTagsRecursive($data);
            if (empty($data->descricao)) {
                return $response->getBody()->write(json_encode([
                    'status'  => false,
                    'message' => 'Preencha o nome do perfil'
                ]),422);
            }

            $data->slug = Util::slugify($data->descricao);

            $entityPerfil = new Perfil($this->pdo);


           
            $data->permissions = json_encode($data->perfil);

            $perfil = $entityPerfil->persist($data);

            if (empty($perfil->id)) {
                
                return $response->getBody()->write(json_encode([
                    'status'  => false,
                    'message' => 'Ocorreu um erro ao salvar/atualizar perfil'
                ]),422);
            }

        
            return $response->getBody()->write(json_encode([
                'status'  => true,
                'message' => 'Perfil salvo com sucesso'
            ]), 200);

        } catch (Throwable $th) {
           
            return $response->getBody()->write(json_encode([
                'error' => $th->getMessage()
            ]), 500);
        }
    }

    public function datatables(Request $request, Response $response, array $args): Response {
        try {
            $data = (object)$request->getQueryParams();
            $data = Util::trimRecursive($data);
            $data = Util::stripTagsRecursive($data);

            $entity = (new Perfil($this->pdo))->datatables($data);
            if (empty($entity)) {
                return $response->getBody()->write(json_encode([
                    'status'  => false,
                    'message' => 'Ocorreu um erro ao exibir dados'
                ]));
            }

            $entity = json_encode($entity);
            $response->getBody()->write($entity);
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
        } catch (Throwable $th) {
            return $response->getBody()->write(json_encode([
                'error' => $th->getMessage(),
            ]));
        }
    }

    public function delete(Request $request, Response $response, array $args) {
        try {
            $data = (object)$request->getParsedBody();
            $data = Util::trimRecursive($data);
            $data = Util::stripTagsRecursive($data);

            if (empty($data->id_perfil)) {
                return $response->getBody()->write(json_encode([
                    'status'  => false,
                    'message' => 'Identificador do perfil não informado'
                ]), 422);
            }

            $entity = new Perfil($this->pdo);
            

            $delete = $entity->delete($data->id_perfil);
            if (!$delete) {
                return $response->getBody()->write(json_encode([
                    'status'  => false,
                    'message' => 'Ocorreu um erro ao excluir perfil'
                ]), 422);
            }

            return $response->getBody()->write(json_encode([
                'status'  => true,
                'message' => 'Perfil excluído com sucesso',
            ]), 200);

        } catch (Throwable $th) {
         
            return $response->getBody()->write(json_encode([
                'error' => $th->getMessage()
            ]), 500);
        }
    }
}