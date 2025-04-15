<?php

namespace App\Command;

use App\Entity\Article;
use App\Entity\Comment;
use App\Entity\Tag;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-sample-data',
    description: 'Creates sample data for the API',
)]
class CreateSampleDataCommand extends Command
{
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Creating sample data for the API');

        // Create users
        $io->section('Creating users');
        $users = $this->createUsers($io);

        // Create tags
        $io->section('Creating tags');
        $tags = $this->createTags($io);

        // Create articles
        $io->section('Creating articles');
        $articles = $this->createArticles($io, $users, $tags);

        // Create comments
        $io->section('Creating comments');
        $this->createComments($io, $articles, $users);

        $io->success('Sample data created successfully!');

        return Command::SUCCESS;
    }

    private function createUsers(SymfonyStyle $io): array
    {
        $users = [];
        $userRepository = $this->entityManager->getRepository(User::class);

        // Check if admin user exists
        $adminUser = $userRepository->findOneBy(['email' => 'admin@example.com']);
        if (!$adminUser) {
            $adminUser = new User();
            $adminUser->setEmail('admin@example.com');
            $adminUser->setUsername('admin');
            $adminUser->setFirstName('Admin');
            $adminUser->setLastName('User');
            $adminUser->setRoles(['ROLE_ADMIN']);
            $adminUser->setPassword(
                $this->passwordHasher->hashPassword($adminUser, 'password123')
            );
            $this->entityManager->persist($adminUser);
            $io->text('Created admin user: admin@example.com / password123');
        } else {
            $io->text('Admin user already exists: admin@example.com');
        }
        $users[] = $adminUser;

        // Check if regular user exists
        $regularUser = $userRepository->findOneBy(['email' => 'user@example.com']);
        if (!$regularUser) {
            $regularUser = new User();
            $regularUser->setEmail('user@example.com');
            $regularUser->setUsername('user');
            $regularUser->setFirstName('Regular');
            $regularUser->setLastName('User');
            $regularUser->setPassword(
                $this->passwordHasher->hashPassword($regularUser, 'password123')
            );
            $this->entityManager->persist($regularUser);
            $io->text('Created regular user: user@example.com / password123');
        } else {
            $io->text('Regular user already exists: user@example.com');
        }
        $users[] = $regularUser;

        // Check if author user exists
        $authorUser = $userRepository->findOneBy(['email' => 'author@example.com']);
        if (!$authorUser) {
            $authorUser = new User();
            $authorUser->setEmail('author@example.com');
            $authorUser->setUsername('author');
            $authorUser->setFirstName('Author');
            $authorUser->setLastName('User');
            $authorUser->setPassword(
                $this->passwordHasher->hashPassword($authorUser, 'password123')
            );
            $this->entityManager->persist($authorUser);
            $io->text('Created author user: author@example.com / password123');
        } else {
            $io->text('Author user already exists: author@example.com');
        }
        $users[] = $authorUser;

        $this->entityManager->flush();

        return $users;
    }

    private function createTags(SymfonyStyle $io): array
    {
        $tags = [];
        $tagNames = ['PHP', 'Symfony', 'API Platform', 'JavaScript', 'React', 'Vue.js', 'Docker', 'MySQL', 'MongoDB', 'Redis'];
        $tagRepository = $this->entityManager->getRepository(Tag::class);

        foreach ($tagNames as $tagName) {
            $tag = $tagRepository->findOneBy(['label' => $tagName]);
            if (!$tag) {
                $tag = new Tag();
                $tag->setLabel($tagName);
                $this->entityManager->persist($tag);
                $io->text("Created tag: {$tagName}");
            } else {
                $io->text("Tag already exists: {$tagName}");
            }
            $tags[] = $tag;
        }

        $this->entityManager->flush();

        return $tags;
    }

    private function createArticles(SymfonyStyle $io, array $users, array $tags): array
    {
        $articles = [];
        $articleRepository = $this->entityManager->getRepository(Article::class);
        $articleData = [
            [
                'title' => 'Getting Started with Symfony',
                'description' => 'Symfony is a PHP framework for web applications and a set of reusable PHP components. This article will guide you through the basics of Symfony and help you get started with your first Symfony project.',
                'author' => $users[2], // author user
                'tags' => [$tags[1], $tags[0], $tags[6]] // Symfony, PHP, Docker
            ],
            [
                'title' => 'Building RESTful APIs with API Platform',
                'description' => 'API Platform is a powerful framework built on top of Symfony that makes it easy to create RESTful APIs. It provides features like content negotiation, data validation, pagination, filtering, sorting, and much more out of the box.',
                'author' => $users[0], // admin user
                'tags' => [$tags[2], $tags[1], $tags[0]] // API Platform, Symfony, PHP
            ],
            [
                'title' => 'Frontend Frameworks Comparison',
                'description' => 'In this article, we will compare the most popular frontend frameworks: React and Vue.js. We will look at their features, performance, learning curve, and community support to help you choose the right framework for your next project.',
                'author' => $users[1], // regular user
                'tags' => [$tags[3], $tags[4], $tags[5]] // JavaScript, React, Vue.js
            ],
            [
                'title' => 'Docker for Development',
                'description' => 'Docker is a platform for developing, shipping, and running applications in containers. This article will show you how to use Docker for your development environment to ensure consistency across different machines and environments.',
                'author' => $users[2], // author user
                'tags' => [$tags[6], $tags[0], $tags[1]] // Docker, PHP, Symfony
            ],
            [
                'title' => 'Database Options for Modern Web Applications',
                'description' => 'Choosing the right database for your web application is crucial. In this article, we will compare different database options like MySQL, MongoDB, and Redis, and discuss their pros and cons for different use cases.',
                'author' => $users[0], // admin user
                'tags' => [$tags[7], $tags[8], $tags[9]] // MySQL, MongoDB, Redis
            ]
        ];

        foreach ($articleData as $data) {
            $existingArticle = $articleRepository->findOneBy(['title' => $data['title']]);
            if (!$existingArticle) {
                $article = new Article();
                $article->setTitle($data['title']);
                $article->setDescription($data['description']);
                $article->setAuthor($data['author']);
                $article->setSlug($this->slugify($data['title']));

                foreach ($data['tags'] as $tag) {
                    $article->addTag($tag);
                }

                $this->entityManager->persist($article);
                $articles[] = $article;
                $io->text("Created article: {$data['title']}");
            } else {
                $io->text("Article already exists: {$data['title']}");
                $articles[] = $existingArticle;
            }
        }

        $this->entityManager->flush();

        return $articles;
    }

    private function createComments(SymfonyStyle $io, array $articles, array $users): void
    {
        $commentRepository = $this->entityManager->getRepository(Comment::class);
        $commentData = [
            [
                'text' => 'Great article! Very informative and well-written.',
                'article' => $articles[0],
                'user' => $users[1]
            ],
            [
                'text' => 'I learned a lot from this. Thanks for sharing!',
                'article' => $articles[0],
                'user' => $users[2]
            ],
            [
                'text' => 'This is exactly what I was looking for. Very helpful!',
                'article' => $articles[1],
                'user' => $users[2]
            ],
            [
                'text' => 'I disagree with some points, but overall a good read.',
                'article' => $articles[1],
                'user' => $users[1]
            ],
            [
                'text' => 'Could you elaborate more on the performance aspects?',
                'article' => $articles[2],
                'user' => $users[0]
            ],
            [
                'text' => 'I\'ve been using Docker for a while now and it\'s been a game-changer for my workflow.',
                'article' => $articles[3],
                'user' => $users[1]
            ],
            [
                'text' => 'Have you considered adding PostgreSQL to the comparison?',
                'article' => $articles[4],
                'user' => $users[2]
            ],
            [
                'text' => 'This article helped me choose the right database for my project. Thanks!',
                'article' => $articles[4],
                'user' => $users[0]
            ],
            [
                'text' => 'I\'ve been using React for a while now and I love it!',
                'article' => $articles[2],
                'user' => $users[0]
            ],
            [
                'text' => 'Docker has been a lifesaver for my team. Great article!',
                'article' => $articles[3],
                'user' => $users[2]
            ]
        ];

        foreach ($commentData as $data) {
            // Check if a similar comment already exists
            $existingComment = $commentRepository->findOneBy([
                'text' => $data['text'],
                'article' => $data['article'],
                'user' => $data['user']
            ]);

            if (!$existingComment) {
                $comment = new Comment();
                $comment->setText($data['text']);
                $comment->setArticle($data['article']);
                $comment->setUser($data['user']);

                $this->entityManager->persist($comment);
                $io->text("Created comment for article: {$data['article']->getTitle()}");
            } else {
                $io->text("Comment already exists for article: {$data['article']->getTitle()}");
            }
        }

        $this->entityManager->flush();
    }

    private function slugify(string $text): string
    {
        // Replace non letter or digits by -
        $text = preg_replace('~[^\pL\d]+~u', '-', $text);

        // Transliterate
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);

        // Remove unwanted characters
        $text = preg_replace('~[^-\w]+~', '', $text);

        // Trim
        $text = trim($text, '-');

        // Remove duplicate -
        $text = preg_replace('~-+~', '-', $text);

        // Lowercase
        $text = strtolower($text);

        if (empty($text)) {
            return 'n-a';
        }

        return $text;
    }
}
