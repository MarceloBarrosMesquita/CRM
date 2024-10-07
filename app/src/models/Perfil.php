<?php

namespace App\Model;

use App\Utils\Session;
use App\Utils\Util;
use App\Utils\Validation;
use stdClass;
use Throwable;

class Perfil {

	public $pdo;

	public function __construct($pdo) {
        $this->pdo = $pdo;
	}

    public function getModulos(): ?array {
        try {
            $stmt = $this->pdo->prepare('
                SELECT  `id`,
                        descricao, 
                        `slug`, 
                        `id_usuario_created`, 
                        `dt_created`, 
                        `fl_is_deleted` 
                FROM `modulos`
                WHERE fl_is_deleted = :fl_is_deleted
                ORDER BY id
            ');
    
            // Bind the parameter for FL_IS_DELETED
            $stmt->bindValue(':fl_is_deleted', 1, \PDO::PARAM_INT);
            
            // Execute the statement
            $stmt->execute();
    
            // Fetch the results as objects
            $result = $stmt->fetchAll(\PDO::FETCH_OBJ);
            
            // If the result is empty, return an empty array
            if (empty($result)) {
                return [];
            }
            return $result;
    
        } catch (Throwable $th) {
           
            return null;
        }
    }
    public function get(): ?array {
        try {
            $stmt = $this->pdo->prepare('
                SELECT  `id`, 
                        `descricao`, 
                        `permissoes`, 
                        `id_usuario_created`, 
                        `dt_created`, 
                        `id_conta`, 
                        `fl_is_deleted`, 
                        `slug`  
                FROM `perfil`
                WHERE fl_is_deleted = :fl_is_deleted
            ');
    
            // Bind the parameter for FL_IS_DELETED
            $stmt->bindValue(':fl_is_deleted', 1, \PDO::PARAM_INT);
            
            // Execute the statement
            $stmt->execute();
    
            // Fetch the result as an object
            $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
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
                        `descricao`, 
                        `permissoes`, 
                        `id_usuario_created`, 
                        `dt_created`, 
                        `id_conta`, 
                        `fl_is_deleted`, 
                        `slug`  
                FROM `perfil`
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
    
    public function persist(stdClass $role): ?stdClass {
        try {
            if (empty($role->id)) {
                // Inserção
                $stmt = $this->pdo->prepare('
                    INSERT INTO `perfil`(
                        `descricao`, 
                        `slug`, 
                        `permissoes`, 
                        `id_usuario_created`, 
                        `dt_created`, 
                        `id_conta`, 
                        `fl_is_deleted`
                    ) VALUES (
                        :descricao, 
                        :slug,
                        :permissions,
                        :id_user_created, 
                        sysdate(),
                        1,
                        :fl_is_deleted
                    )
                ');
    
                // Executa a inserção
                $stmt->bindValue(':descricao', $role->descricao);
                $stmt->bindValue(':slug', $role->slug);
                $stmt->bindValue(':permissions', $role->permissions ?? '');
                $role->id_user_created = $_SESSION['session_user']['id'];
                $stmt->bindValue(':id_user_created', $role->id_user_created);
                $stmt->bindValue(':fl_is_deleted', 1);
                $stmt->execute();
    
                // Obter o ID gerado
                $role->id = $this->pdo->lastInsertId();
            } else {
                // Atualização
                $stmt = $this->pdo->prepare('
                    UPDATE perfil SET
                        descricao = :descricao,
                        slug = :slug,
                        permissoes = :permissions,
                        id_usuario_created = :id_user_created,
                        fl_is_deleted = :fl_is_deleted
                    WHERE id = :id
                ');
    
                $stmt->bindValue(':id', $role->id);
                $stmt->bindValue(':descricao', $role->descricao);
                $stmt->bindValue(':slug', $role->slug);
                $stmt->bindValue(':permissions', $role->permissions ?? '');
                $role->id_user_created =  $_SESSION['session_user']['id'];
                $stmt->bindValue(':id_user_created', $role->id_user_created);
                $stmt->bindValue(':fl_is_deleted', 1);
    
                // Executa a atualização
                $stmt->execute();
            }
    
            return $role;
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
                    UPDATE perfil SET
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
    
            $datatables_table = 'perfil p';
            $datatables_index = 'p.id';
    
            $datatables_columns = array(
                'p.id',
                'p.descricao',
                'p.dt_created',
            );
    
            $datatables_columns_searching = array(
                'p.id',
                'p.descricao',
                'p.dt_created'
            );
    
            $datatables_columns_ordering = array(
                'p.id',
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
            $where = " WHERE p.fl_is_deleted = :fl_is_deleted ";
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
    
            $query = "SELECT " . implode(', ', $datatables_columns) . ", COUNT(1) OVER() AS total_records 
                      FROM " . $datatables_table . $where . " " . $sOrder . " " . $limit;
    
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
