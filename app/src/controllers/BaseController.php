<?php

namespace App\Controller;

use App\Model\Fila;
use Mpdf\Mpdf;
use Slim\Container;

class BaseController {
	protected $view;
    protected $pdo;

    public function __construct(Container $c = null) {

		if ($c != null) {
			$this->view = $c->get('view');
			$this->pdo = $c->get('pdo');
		}
	}

}
