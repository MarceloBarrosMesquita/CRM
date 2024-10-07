<?php
/** @noinspection SqlResolve */
/** @noinspection DuplicatedCode */
/** @noinspection SqlDialectInspection */
/** @noinspection SpellCheckingInspection */
/** @noinspection SqlNoDataSourceInspection */
/** @noinspection PhpComposerExtensionStubsInspection */

namespace App\Model;

use PDO;
use stdClass;
use DateTime;
use Throwable;
use App\Utils\Util;
use Monolog\Logger;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManager;
use Doctrine\DBAL\ParameterType;

class Usuario {

    public $pdo;

	public function __construct($pdo) {
        $this->pdo = $pdo;
	}

    public function get(): ?stdClass {
        try {
            $stmt = $this->pdo->prepare('
                SELECT  `id`,
                        `nome`, 
                        `login`, 
                        `email`, 
                        `telefone`, 
                        `celular`, 
                        `cpf`, 
                        `id_perfil`, 
                        `fl_is_deleted`, 
                        `id_conta`, 
                        `id_usuario_created`, 
                        `dt_created` 
                FROM `usuarios`
                WHERE fl_is_deleted = :fl_is_deleted
            ');
    
            // Bind the parameter for FL_IS_DELETED
            $stmt->bindValue(':fl_is_deleted', 1, \PDO::PARAM_INT);
            
            // Execute the statement
            $stmt->execute();
    
            // Fetch the result as an object
            $result = $stmt->fetch(\PDO::FETCH_OBJ);
            
            // Return the result or null if no record was found
            return $result ?: null;
    
        } catch (Throwable $th) {
            // Optional: handle the exception (log, rethrow, etc.)
           
            return null;
        }
    }
    public function getById($id): ?stdClass {
        try {
            $stmt = $this->pdo->prepare('
                SELECT  `id`,
                        `nome`, 
                        `login`, 
                        `email`, 
                        `senha`, 
                        `telefone`, 
                        `celular`, 
                        `cpf`, 
                        `id_perfil`, 
                        `fl_is_deleted`, 
                        `id_conta`, 
                        `id_usuario_created`, 
                        `dt_created` 
                FROM `usuarios`
                WHERE fl_is_deleted = :fl_is_deleted
                AND id = :id
            ');
    
            // Bind the parameter for FL_IS_DELETED
            $stmt->bindValue(':fl_is_deleted', 1, \PDO::PARAM_INT);
            $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
            
            // Execute the statement
            $stmt->execute();
    
            // Fetch the result as an object
            $result = $stmt->fetch(\PDO::FETCH_OBJ);
            
            // Return the result or null if no record was found
            return $result ?: null;
    
        } catch (Throwable $th) {
            // Optional: handle the exception (log, rethrow, etc.)
           
            return null;
        }
    }
    
    public function persist(stdClass $usuario): ?stdClass {
        try {

            $usuario->cpf = preg_replace('/\D/', '', $usuario->cpf);
            $usuario->telefone = preg_replace('/\D/', '', $usuario->telefone);
            $usuario->celular = preg_replace('/\D/', '', $usuario->celular);
            $usuario->id_user_created = $_SESSION['session_user']['id'];
            if (empty($usuario->id)) {
                // Inserção
                $stmt = $this->pdo->prepare('
                    INSERT INTO `usuarios`(
                        `nome`, 
                        `login`, 
                        `email`,
                        `senha`,
                        `telefone`, 
                        `celular`, 
                        `cpf`, 
                        `id_perfil`, 
                        `fl_is_deleted`, 
                        `id_conta`, 
                        `id_usuario_created`, 
                        `dt_created`
                        )VALUES (
                        :nome, 
                        :login,
                        :email,
                        :senha, 
                        :telefone, 
                        :celular, 
                        :cpf, 
                        :id_perfil, 
                        :fl_is_deleted, 
                        :id_conta, 
                        :id_user_created, 
                        sysdate()
                    )
                ');
    
                // Executa a inserção
                $stmt->bindValue(':nome', $usuario->nome);
                $stmt->bindValue(':login', $usuario->login);
                $stmt->bindValue(':email', $usuario->email);
                $stmt->bindValue(':senha', $usuario->password);
                $stmt->bindValue(':telefone', $usuario->telefone);
                $stmt->bindValue(':celular', $usuario->celular);
                $stmt->bindValue(':cpf', $usuario->cpf);
                $stmt->bindValue(':id_perfil', $usuario->id_perfil);
                if($usuario->id_user_created==1){
                    $stmt->bindValue(':id_conta', $usuario->id_conta);
                }
                else{
                    $stmt->bindValue(':id_conta', $_SESSION['session_user']['id_conta']);
                }
                
                
                $stmt->bindValue(':id_user_created', $usuario->id_user_created);
                $stmt->bindValue(':fl_is_deleted', 1);
                $stmt->execute();
    
                // Obter o ID gerado
                $usuario->id = $this->pdo->lastInsertId();
            } else {
                // Atualização
                $stmt = $this->pdo->prepare('
                    UPDATE usuarios SET
                        nome = :nome,
                        login = :login,
                        email = :email,
                        senha = :senha,
                        telefone = :telefone,
                        celular = :celular,
                        cpf = :cpf,
                        id_perfil = :id_perfil,
                        id_conta = :id_conta,
                        id_usuario_created = :id_user_created,
                        fl_is_deleted = :fl_is_deleted
                    WHERE id = :id
                ');
    
                $stmt->bindValue(':id', $usuario->id);
                $stmt->bindValue(':nome', $usuario->nome);
                $stmt->bindValue(':login', $usuario->login);
                $stmt->bindValue(':email', $usuario->email);
                $stmt->bindValue(':senha', $usuario->password);
                $stmt->bindValue(':telefone', $usuario->telefone);
                $stmt->bindValue(':celular', $usuario->celular);
                $stmt->bindValue(':cpf', $usuario->cpf);
                $stmt->bindValue(':id_perfil', $usuario->id_perfil);
                if($usuario->id_user_created==1){
                    $stmt->bindValue(':id_conta', $usuario->id_conta);
                }
                else{
                    $stmt->bindValue(':id_conta', $_SESSION['session_user']['id_conta']);
                }
                $stmt->bindValue(':id_user_created', $usuario->id_user_created);
                $stmt->bindValue(':fl_is_deleted', 1);
    
                // Executa a atualização
                $stmt->execute();
            }
    
            return $usuario;
        } catch (Throwable $th) {
            print_r($th->getMessage());
            die();
           
            return null;
        }
    }
    public function delete(int $id) {
        try {
            
                // Atualização
                $stmt = $this->pdo->prepare('
                    UPDATE usuarios SET
                        fl_is_deleted = 2
                    WHERE id = :id
                ');
    
                $stmt->bindValue(':id', $id);
    
                // Executa a atualização
                $stmt->execute();
            
    
            return $id;
        } catch (Throwable $th) {
            print_r($th->getMessage());
            die();
           
            return null;
        }
    }
    

	public function datatables(stdClass $data) : ?stdClass {
        try {
            $bindNames = [];
    
            $datatables_table = 'usuarios u';
            $datatables_index = 'u.id';
    
            $datatables_columns = array(
                'u.id',
                'u.nome',
                'u.login',
                'p.descricao perfil',
            );
    
            $datatables_columns_searching = array(
                'u.id',
                'u.nome',
                'u.login',
                'p.descricao'
            );
    
            $datatables_columns_ordering = array(
                'u.id',
                'u.nome',
            );
    
            // Ordering
            $sOrder = "ORDER BY " . $datatables_index;
            if (isset($_GET['order'][0]['column'])) {
                if ($_GET['columns'][$_GET['order'][0]['column']]['orderable'] == "true") {
                    $sOrder = 'ORDER BY ' . $datatables_columns_ordering[$_GET['order'][0]['column']];
                    $sOrder .= (strcasecmp(($_GET['order'][0]['dir']), "asc") == 0) ? ' ASC' : ' DESC';
                }
            }
    
            // Filtering
            $where = " WHERE u.fl_is_deleted = :fl_is_deleted ";
            $bindNames['fl_is_deleted'] = 1; // Definindo o valor de fl_is_deleted aqui
    
            if (!empty($_GET['search']['value'])) {
                $where .= " AND (";
                for ($i = 0; $i < count($datatables_columns_searching); $i++) {
                    $bindName = 'search' . ($i + 1);
                    $last = $i == (count($datatables_columns_searching) - 1);
                    $where .= 'UPPER(' . $datatables_columns_searching[$i] . ') LIKE UPPER(:' . $bindName . ')' . (!$last ? ' OR ' : ')');
                    $bindNames[$bindName] = '%' . $_GET['search']['value'] . '%';
                }
            }
    
            $limit = '';
            if (isset($data->start) && $data->length != '-1') {
                // Para o MySQL, não é possível usar marcadores nomeados em LIMIT
                $limit = 'LIMIT ' . intval($data->start) . ', ' . intval($data->length);
            }
    
            $relations = ' INNER JOIN perfil p on u.id_perfil = p.id';
    
            $query = "SELECT " . implode(', ', $datatables_columns) . ", COUNT(1) OVER() AS total_records 
                      FROM " . $datatables_table .$relations. $where . " " . $sOrder . " " . $limit;
           
            $stmt = $this->pdo->prepare($query);
            
            // Vincula os parâmetros nomeados
            foreach ($bindNames as $name => $value) {
                $stmt->bindValue(':' . $name, $value);
            }
            
            $stmt->execute();
            $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    
            $output = [
                'draw'            => (int)$data->draw,
                'recordsFiltered' => count($result) > 0 ? intval($result[0]['total_records']) : 0,
                'recordsTotal'    => count($result) > 0 ? intval($result[0]['total_records']) : 0,
                'data'            => $result,
            ];
    
            return (object)$output;
    
        } catch (Throwable $th) {
            print_r($th->getMessage());
            return null;
        }
    }   
}