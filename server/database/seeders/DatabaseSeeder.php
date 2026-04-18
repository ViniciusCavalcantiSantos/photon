<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (\App\Models\User::count() > 0) {
            $this->command->info('Database already seeded. Skipping.');
            return;
        }

        $this->call([
            UserSeeder::class,
            ContractCategorySeeder::class,
            ContractSeeder::class,
            EventTypeSeeder::class,
            EventSeeder::class,
        ]);
    }
}
