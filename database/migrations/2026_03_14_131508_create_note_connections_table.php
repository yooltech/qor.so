<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('note_connections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('note_id')->constrained()->onDelete('cascade');
            $table->string('device_id')->index(); // browser fingerprint or id
            $table->string('device_name')->nullable();
            $table->string('status')->default('pending'); // 'pending', 'allowed', 'denied'
            $table->string('permissions')->default('view'); // 'view', 'edit'
            $table->timestamps();
            
            $table->unique(['note_id', 'device_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('note_connections');
    }
};
