<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class MakeAdminController
{
    /**
     * @var EntityManagerInterface
     */
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function __invoke(User $data)
    {
        $roles = $data->getRoles();
        if(!in_array("ROLE_ADMIN",$roles)){
            $data->setRoles(["ROLE_ADMIN"]);
            $this->entityManager->persist($data);
            $this->entityManager->flush();
        }
        return $data;
    }
}
