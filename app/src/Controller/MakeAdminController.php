<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class MakeAdminController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    public function __invoke(User $data): User
    {
        $roles = $data->getRoles();
        if(!in_array("ROLE_ADMIN",$roles)){
            $data->setRoles(["ROLE_ADMIN"]);
            $this->entityManager->persist($data);
            $this->entityManager->flush();
        } else {
            throw new \Exception("This user is already an admin");
        }
        return $data;
    }
}
