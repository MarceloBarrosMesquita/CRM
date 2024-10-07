<?php

namespace App\Middleware;

use Slim\Container;

class BaseMiddleware {

	public $view;
	protected $pdo;

	public function __construct(Container $c = null) {
		if ($c != null) {
			$this->view = $c->get('view');
			$this->pdo = $c->get('pdo');
		}
	}
}
