<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (User::where('email', 'admin@photon.com')->exists()) {
            return;
        }

        User::factory()->withOrganization()->create([
            'name' => 'Administrador',
            'email' => 'admin@photon.com',
            'password' => bcrypt('12345678'),
            'email_verified_at' => now()->toDateTimeString(),
        ]);
    }
}
