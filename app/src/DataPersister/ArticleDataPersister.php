<?php


namespace App\DataPersister;


use ApiPlatform\Core\DataPersister\ContextAwareDataPersisterInterface;
use App\Entity\Article;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Security;


class ArticleDataPersister  implements ContextAwareDataPersisterInterface
{
    private $em;
    private $request;
    private $security;
    public function __construct(EntityManagerInterface $em, RequestStack $request,
                                  Security $security)
    {
        $this->em = $em;
        $this->request = $request->getCurrentRequest();
        $this->security = $security;
    }

    public function supports($data, array $context = []): bool
    {
        return $data instanceof Article;
    }

    public function persist($data, array $context = [])
    {
        if ($this->request->getMethod() === 'POST') {
            $data->setAuthor($this->security->getUser());
        }
        if ($this->request->getMethod() !== 'POST') {
            $data->setUpdatedAt(new \DateTime());
        }
        $this->em->persist($data);
        $this->em->flush();
    }

    public function remove($data, array $context = [])
    {
        $this->em->remove($data);
        $this->em->flush();
    }
}