<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force the base path if we are in a subfolder
        $path = parse_url(config('app.url'), PHP_URL_PATH);
        if ($path && $path !== '/') {
             $this->app['request']->server->set('SCRIPT_NAME', $path . '/index.php');
             $this->app['request']->server->set('PHP_SELF', $path . '/index.php');
        }
    }
}
