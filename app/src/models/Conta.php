<?php

namespace App\Model;

use App\Utils\Session;
use App\Utils\Util;
use App\Utils\Validation;
use stdClass;
use Throwable;

class Conta {

	public $pdo;

	public function __construct($pdo) {
        $this->pdo = $pdo;
	}

   
    public function getById($id): ?stdClass {
        try {
            $stmt = $this->pdo->prepare('
                SELECT  `id`,
                        `id_usuario_created`, 
                        `dt_created`, 
                        `id_segmento`, 
                        `fl_tipo_conta`, 
                        `fl_tipo_pessoa`, 
                        `identificacao_conta`, 
                        `razao_social`, 
                        `cpf_cnpj`, 
                        `telefone`, 
                        `celular`, 
                        `email`, 
                        `cep`, 
                        `endereco`, 
                        `numero`, 
                        `bairro`, 
                        `complemento`, 
                        `cidade`, 
                        `estado`, 
                        date_format(data_inicio_sistema,"%d/%m/%Y")data_inicio_sistema, 
                        `dia_faturamento`, 
                        `id_plano`, 
                         FORMAT(`valor_setup`, 2, "de_DE")valor_setup, 
                        `parcelas_setup`, 
                        `fl_is_deleted`, 
                        date_format(data_cancelamento,"%d/%m/%Y")data_cancelamento 
                FROM `contas`
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
    public function get(): ?array {
        try {
            $stmt = $this->pdo->prepare('
                SELECT  `id`,
                        `id_usuario_created`, 
                        `dt_created`, 
                        `id_segmento`, 
                        `fl_tipo_conta`, 
                        `fl_tipo_pessoa`, 
                        `identificacao_conta`, 
                        `razao_social`, 
                        `cpf_cnpj`, 
                        `telefone`, 
                        `celular`, 
                        `email`, 
                        `cep`, 
                        `endereco`, 
                        `numero`, 
                        `bairro`, 
                        `complemento`, 
                        `cidade`, 
                        `estado`, 
                        date_format(data_inicio_sistema,"%d/%m/%Y")data_inicio_sistema, 
                        `dia_faturamento`, 
                        `id_plano`, 
                         FORMAT(`valor_setup`, 2, "de_DE")valor_setup, 
                        `parcelas_setup`, 
                        `fl_is_deleted`, 
                        date_format(data_cancelamento,"%d/%m/%Y")data_cancelamento 
                FROM `contas`
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
    public function getPlanos(): ?array {
        try {
            $stmt = $this->pdo->prepare('
                SELECT `id`, 
                       `id_usuario_created`, 
                       `dt_created`, 
                       `descricao`, 
                       `valor`, 
                       `fl_is_deleted` 
                FROM `planos` 
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
    
    public function persist(stdClass $account): ?stdClass {
        try {
            // Remover caracteres não numéricos dos campos CEP, CPF/CNPJ e telefones
            $account->cpf_cnpj = preg_replace('/\D/', '', $account->cpf_cnpj);
            $account->cep = preg_replace('/\D/', '', $account->cep);
            $account->telefone = preg_replace('/\D/', '', $account->telefone);
            $account->celular = preg_replace('/\D/', '', $account->celular);
    
            // Converter valores monetários de string para float
            $account->valor_setup = str_replace('.', '', $account->valor_setup);
            $account->valor_setup = str_replace(',', '.', $account->valor_setup);
    
            // Converter datas para o formato americano
            $account->data_inicio_sistema = date('Y-m-d', strtotime(str_replace('/', '-', $account->data_inicio_sistema)));
            if (!empty($account->data_cancelamento)) {
                $account->data_cancelamento = date('Y-m-d', strtotime(str_replace('/', '-', $account->data_cancelamento)));
            }
            else{
                $account->data_cancelamento = null;
            }
    
            
            if (empty($account->id)) {
                // Inserção
                $stmt = $this->pdo->prepare('
                    INSERT INTO contas (
                        id_usuario_created, dt_created, fl_tipo_conta, fl_tipo_pessoa,
                        identificacao_conta, razao_social, cpf_cnpj, telefone, celular, email, 
                        cep, endereco, numero, bairro, complemento, cidade, estado, data_inicio_sistema, 
                        dia_faturamento, id_plano, valor_setup, parcelas_setup, fl_is_deleted, data_cancelamento
                    ) VALUES (
                        :id_usuario_created, sysdate(), :fl_tipo_conta, :fl_tipo_pessoa, 
                        :identificacao_conta, :razao_social, :cpf_cnpj, :telefone, :celular, :email, 
                        :cep, :endereco, :numero, :bairro, :complemento, :cidade, :estado, :data_inicio_sistema, 
                        :dia_faturamento, :id_plano, :valor_setup, :parcelas_setup, 1, :data_cancelamento
                    )
                ');
    
                // Bind values
                $stmt->bindValue(':id_usuario_created', 1); // Exemplo de ID de usuário
                $stmt->bindValue(':fl_tipo_conta', $account->fl_tipo_conta);
                $stmt->bindValue(':fl_tipo_pessoa', $account->fl_tipo_pessoa);
                $stmt->bindValue(':identificacao_conta', $account->identificacao_conta);
                $stmt->bindValue(':razao_social', $account->razao_social);
                $stmt->bindValue(':cpf_cnpj', $account->cpf_cnpj);
                $stmt->bindValue(':telefone', $account->telefone);
                $stmt->bindValue(':celular', $account->celular);
                $stmt->bindValue(':email', $account->email);
                $stmt->bindValue(':cep', $account->cep);
                $stmt->bindValue(':endereco', $account->endereco);
                $stmt->bindValue(':numero', $account->numero);
                $stmt->bindValue(':bairro', $account->bairro);
                $stmt->bindValue(':complemento', $account->complemento);
                $stmt->bindValue(':cidade', $account->cidade);
                $stmt->bindValue(':estado', $account->estado);
                $stmt->bindValue(':data_inicio_sistema', $account->data_inicio_sistema);
                $stmt->bindValue(':dia_faturamento', $account->dia_fatuamento);
                $stmt->bindValue(':id_plano', $account->id_plano);
                $stmt->bindValue(':valor_setup', $account->valor_setup);
                $stmt->bindValue(':parcelas_setup', $account->parcelas_setup);
                $stmt->bindValue(':data_cancelamento', $account->data_cancelamento);
    
                $stmt->execute();
    
                // Obter o ID gerado
                $account->id = $this->pdo->lastInsertId();
            } else {
                // Atualização
                $stmt = $this->pdo->prepare('
                    UPDATE contas SET
                        fl_tipo_conta = :fl_tipo_conta,
                        fl_tipo_pessoa = :fl_tipo_pessoa,
                        identificacao_conta = :identificacao_conta,
                        razao_social = :razao_social,
                        cpf_cnpj = :cpf_cnpj,
                        telefone = :telefone,
                        celular = :celular,
                        email = :email,
                        cep = :cep,
                        endereco = :endereco,
                        numero = :numero,
                        bairro = :bairro,
                        complemento = :complemento,
                        cidade = :cidade,
                        estado = :estado,
                        data_inicio_sistema = :data_inicio_sistema,
                        dia_faturamento = :dia_faturamento,
                        id_plano = :id_plano,
                        valor_setup = :valor_setup,
                        parcelas_setup = :parcelas_setup,
                        data_cancelamento = :data_cancelamento
                    WHERE id = :id
                ');
    
                // Bind values for update
                $stmt->bindValue(':id', $account->id);
                $stmt->bindValue(':fl_tipo_conta', $account->fl_tipo_conta);
                $stmt->bindValue(':fl_tipo_pessoa', $account->fl_tipo_pessoa);
                $stmt->bindValue(':identificacao_conta', $account->identificacao_conta);
                $stmt->bindValue(':razao_social', $account->razao_social);
                $stmt->bindValue(':cpf_cnpj', $account->cpf_cnpj);
                $stmt->bindValue(':telefone', $account->telefone);
                $stmt->bindValue(':celular', $account->celular);
                $stmt->bindValue(':email', $account->email);
                $stmt->bindValue(':cep', $account->cep);
                $stmt->bindValue(':endereco', $account->endereco);
                $stmt->bindValue(':numero', $account->numero);
                $stmt->bindValue(':bairro', $account->bairro);
                $stmt->bindValue(':complemento', $account->complemento);
                $stmt->bindValue(':cidade', $account->cidade);
                $stmt->bindValue(':estado', $account->estado);
                $stmt->bindValue(':data_inicio_sistema', $account->data_inicio_sistema);
                $stmt->bindValue(':dia_faturamento', $account->dia_fatuamento);
                $stmt->bindValue(':id_plano', $account->id_plano);
                $stmt->bindValue(':valor_setup', $account->valor_setup);
                $stmt->bindValue(':parcelas_setup', $account->parcelas_setup);
                $stmt->bindValue(':data_cancelamento', $account->data_cancelamento);
    
                // Executa a atualização
                $stmt->execute();
            }
    
            return $account;
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
    
            $datatables_table = 'contas c';
            $datatables_index = 'c.id';
    
            $datatables_columns = array(
                'c.id',
                'CASE c.fl_tipo_conta when 1 then "Principal" when 2 then "Vinculado" end fl_tipo_conta',
                'CASE c.fl_tipo_pessoa when 1 then "CNPJ" when 2 then "CPF" end fl_tipo_pessoa',
                'c.identificacao_conta',
                'c.razao_social',
                'c.cpf_cnpj',
                'DATE_FORMAT(c.data_inicio_sistema,"%d/%m/%Y")data_inicio_sistema',
                'c.dia_faturamento',
                'DATE_FORMAT(c.data_cancelamento,"%d/%m/%Y")data_cancelamento',
                
            );
    
            $datatables_columns_searching = array(
                'c.id',
                'c.razao_social'
            );
    
            $datatables_columns_ordering = array(
                'c.id',
                'c.razao_social',
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
            $where = " WHERE 1=1 ";
            //$where = " WHERE c.fl_is_deleted = :fl_is_deleted ";
            //$bindNames['fl_is_deleted'] = 1; // Definindo o valor de fl_is_deleted aqui
    
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

            $relations = '';
    
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
