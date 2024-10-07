<?php

namespace App\Model;

use App\Utils\Session;
use App\Utils\Util;
use App\Utils\Validation;

class Login {

	public $pdo;

	public function __construct($pdo) {
        $this->pdo = $pdo;
	}

	public function login($data) {
	    $retorno = new \StdClass;
		$retorno->status = false;
		$retorno->data = [];

		//$data = Util::trimInArray($data);
		

		/* VALID FORM */
		$v = Validation::check([
			'user'     => [
				'value'    => @$data['login'],
				'error'    => 'Preencha seu usuário',
				'required' => true
			],
			'password' => [
				'value'    => @$data['password'],
				'error'    => 'Preencha sua senha',
				'required' => true
			]
		]);

		if (!$v['status']) {
			$retorno->message = $v['messages'][0]->message;
			return $retorno;
		}
		$SQL = " SELECT u.id, 
						u.nome, 
						u.login, 
						u.email, 
						u.id_perfil, 
						u.telefone, 
						u.celular, 
						u.cpf, 
						u.id_perfil, 
						u.fl_is_deleted, 
						u.id_conta, 
						u.id_usuario_created, 
						u.dt_created, 
						u.senha , 
						p.descricao perfil, 
						p.permissoes
				FROM usuarios u 
				inner join perfil p on u.id_perfil = p.id 
                where u.login = :login
            	and u.senha = :password";

				

        $stmt = $this->pdo->prepare( $SQL );
        $stmt->execute(
            [
                ':login' => $data['login'],
                ':password' => $data['password']
            ]
        );

        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

		/* USUARIO NAO ENCONTRADO */
		if (!$rows) {
			$retorno->message = 'Credenciais Inválidas usuario não encontrado';
			return $retorno;
		}

		$rows[0]['permissoes'] = json_encode($rows[0]['permissoes']);
		
		$_SESSION['session_user'] = $rows[0];
		

		$retorno->status = true;
		$retorno->message = 'Usuário autenticado com sucesso';
		$retorno->data = $rows[0];

		return $retorno;
	}

	public function UpdateSenha($data){
		$retorno = new \StdClass;
		$retorno->status = false;
		$retorno->data = [];

		$fields = array();
		//FIELDS ========== NOMECLATURA IGUAL A DO BANCO DE DADOS!!!!
		//PARAMETRO, NESSE CASO O DARA QUE VEM DENTRO DOS "()" DA FUNÇÃO, PRECISA VERIDICAR SEMPRE O NOME QUE ESTÁ SENDO PASSADO!!!
		$fields['ds_senha_portal'] = $data['password1'];

		Util::execUpdate("colaboradores", $fields, " ds_cpf = '".$data['ds_login_nova_senha']."'",$this->pdo);

		$SQL = "select 	c.pk,
						c.ds_colaborador, 
						c.ds_cpf,
						c.ds_email
				from colaboradores c
				where c.ds_cpf = :login
				and c.ds_senha_portal = :password";

        $stmt = $this->pdo->prepare( $SQL );
        $stmt->execute(
            [
                ':login' => $data['ds_login_nova_senha'],
                ':password' => $data['password1']
            ]
        );

        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

		/* USUARIO NAO ENCONTRADO */
		if (!$rows) {
			$retorno->message = 'Credenciais Inválidas usuario não encontrado';
			return $retorno;
		}
		$_SESSION['session_user'] = $rows[0];
	

		$retorno->status = true;
		$retorno->message = 'Usuário autenticado com sucesso';
		$retorno->data = $rows[0];

		return $retorno;



	}

    public function apiLogoff() {
        $retorno = new \StdClass;
        $retorno->status = false;
        $retorno->data = [];

        Session::cleanSession();

        $retorno->status = true;
        $retorno->message = 'Logout efetuado com sucesso';
        return $retorno;
    }


	public function verificarTrocaSenha($data) {
	    $retorno = new \StdClass;
		$retorno->status = false;
		$retorno->data = [];

		//$data = Util::trimInArray($data);
		

		/* VALID FORM */
		$v = Validation::check([
			'user'     => [
				'value'    => @$data['login'],
				'error'    => 'Preencha seu usuário',
				'required' => true
			],
			'password' => [
				'value'    => @$data['password'],
				'error'    => 'Preencha sua senha',
				'required' => true
			]
		]);

		if (!$v['status']) {
			$retorno->message = $v['messages'][0]->message;
			return $retorno;
		}
		$SQL = "select *
                from colaboradores c
                where c.ds_cpf = :login
                	and c.ds_senha_portal = :password";

        $stmt = $this->pdo->prepare( $SQL );
        $stmt->execute(
            [
                ':login' => $data['login'],
                ':password' => $data['password']
            ]
        );

        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

		/* USUARIO NAO ENCONTRADO */
		if (!$rows) {
			$retorno->message = 'Credenciais Inválidas usuario não encontrado';
			return $retorno;
		}
		
		

		$retorno->status = true;
		$retorno->message = 'Usuário autenticado com sucesso';
		$retorno->data = count($rows);

		return $retorno;
	}
}
