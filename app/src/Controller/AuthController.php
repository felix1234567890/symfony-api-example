<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AuthController extends AbstractController
{
    #[Route('/api/login', name: 'login', methods: ['POST'])]
    public function index(): Response
    {
        // This method is not used directly as the JWT authentication is handled by the security system
        // The actual authentication is handled by the lexik_jwt_authentication bundle
        return new Response('Authentication handled by JWT bundle');
    }
}
