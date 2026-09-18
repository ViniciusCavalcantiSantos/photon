{{-- resources/views/emails/password-reset.blade.php --}}
@props(['user', 'token'])

@php
    $appName = config('app.name', 'Photon');
    $appUrlClient = config('app.url_client');
    $resetUrl = "{$appUrlClient}/reset-password?token={$token}&email=" . urlencode($user->email);
@endphp

        <!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ __('Reset Password') }} — {{ $appName }}</title>
</head>
<body style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f6f6f6; margin:0; padding:20px;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,0.06); max-width: 600px;">
                <tr>
                    <td style="padding:28px 32px; text-align:left;">
                        <h2 style="margin:0 0 8px 0;">{{ __('Reset your password') }}</h2>
                        <p style="margin:0 0 18px 0; color:#555;">
                            {{ __('Hello :name, we received a request to reset your password for :app.', ['name' => $user->name ?? $user->email, 'app' => $appName]) }}
                        </p>

                        <div style="text-align:center; margin:26px 0;">
                            <a href="{{ $resetUrl }}" target="_blank" rel="noopener"
                               style="display:inline-block; padding:12px 22px; border-radius:8px; text-decoration:none; font-weight:600; border:1px solid #1a73e8; background:#1a73e8; color:#ffffff;">
                                {{ __('Reset Password') }}
                            </a>
                        </div>

                        <p style="color:#666; font-size:13px;">
                            {{ __("If the button above doesn't work, copy and paste the link below into your browser:") }}
                        </p>
                        <p style="word-break:break-all; font-size:13px; color:#1a73e8;">
                            <a href="{{ $resetUrl }}" target="_blank" rel="noopener" style="color:#1a73e8; text-decoration:none;">{{ $resetUrl }}</a>
                        </p>

                        <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">

                        <p style="color:#999; font-size:12px; margin:0;">
                            {{ __("If you didn't request a password reset, please ignore this email — nothing will be changed.") }}
                            {!! __('This link expires in <strong>:minutes minutes</strong>.', ['minutes' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire')]) !!}
                        </p>

                        <p style="color:#999; font-size:12px; margin-top:12px;">
                            — {{ __('The :app Team', ['app' => $appName]) }}
                        </p>
                    </td>
                </tr>

                <tr>
                    <td style="background:#fafafa; padding:12px 32px; text-align:center; color:#999; font-size:12px;">
                        © {{ date('Y') }} {{ $appName }}. {{ __('All rights reserved.') }}
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<div style="display:none; white-space:pre; font-family:monospace; font-size:12px; color:#111;">
    {{ __('Hello :name, we received a request to reset your password for :app.', ['name' => $user->name ?? $user->email, 'app' => $appName]) }}

    {{ __('You are receiving this email because we received a password reset request for your account.') }}

    {{ __('Use the link below to reset your password:') }}
    {{ $resetUrl }}

    {{ __("If you didn't request the reset, ignore this message.") }} {{ __('This password reset link will expire in :count minutes.', ['count' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire')]) }}
</div>
</body>
</html>
