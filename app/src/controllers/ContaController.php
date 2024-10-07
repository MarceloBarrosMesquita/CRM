<?php

namespace App\Controller;
use App\Utils\Session;
use App\Model\Conta;
use App\Utils\Util;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Throwable;
use stdClass;

final class ContaController extends BaseController {

	public function list(Request $request, Response $response, $args) {
        try{
            $this->view->render($response, 'conta/list.twig');
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

            $conta = false;
            $entityConta = new Conta($this->pdo);

            if (!empty($data->id)) {
                $conta = $entityConta->getById($data->id);
            }
            $planos = $entityConta->getPlanos();
            
            $this->view->render($response, 'conta/form.twig', array(
                'entity'           => $conta,
                'planos'           =>$planos
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
            $entityConta = new Conta($this->pdo);

            $conta = $entityConta->persist($data);

            if (empty($conta->id)) {
                
                return $response->getBody()->write(json_encode([
                    'status'  => false,
                    'message' => 'Ocorreu um erro ao salvar/atualizar conta'
                ]),422);
            }

        
            return $response->getBody()->write(json_encode([
                'status'  => true,
                'message' => 'Conta salva com sucesso'
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

            $entity = (new Conta($this->pdo))->datatables($data);
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

            if (empty($data->id_conta)) {
                return $response->getBody()->write(json_encode([
                    'status'  => false,
                    'message' => 'Identificador do Conta não informado'
                ]), 422);
            }

            $entity = new Conta($this->pdo);
            

            $delete = $entity->delete($data->id_conta);
            if (!$delete) {
                return $response->getBody()->write(json_encode([
                    'status'  => false,
                    'message' => 'Ocorreu um erro ao excluir conta'
                ]), 422);
            }

            return $response->getBody()->write(json_encode([
                'status'  => true,
                'message' => 'Conta excluído com sucesso',
            ]), 200);

        } catch (Throwable $th) {
         
            return $response->getBody()->write(json_encode([
                'error' => $th->getMessage()
            ]), 500);
        }
    }
}