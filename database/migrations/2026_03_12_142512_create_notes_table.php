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
        Schema::create('notes', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->text('content');
            $table->string('format')->default('text');
            $table->string('title')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('password_hash')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('slug')->unique()->nullable();
            $table->boolean('is_encrypted')->default(false);
            $table->integer('size_bytes')->default(0);
            $table->integer('view_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
