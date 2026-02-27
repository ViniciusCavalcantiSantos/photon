<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as BaseCsrfToken;
use Illuminate\Http\Request;

class VerifyCsrfToken
{
    /**
     * If the request authenticates via a Bearer token, dynamically add its
     * path to VerifyCsrfToken's exclude list for this request cycle.
     *
     * Bearer tokens are inherently CSRF-safe: a cross-site attacker cannot
     * read the token value and inject it as an Authorization header.
     * Session-based requests do not have a Bearer token, so they still go
     * through the normal CSRF verification.
     */
    public function handle(Request $request, \Closure $next)
    {
        if ($request->bearerToken()) {
            BaseCsrfToken::except($request->path());
        }

        return $next($request);
    }
}
