<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;    

class AuthController extends Controller
{
    public function login(Request $request) {
        $credentials = $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        if  (Auth::attempt($credentials)) {
            $user = \App\Models\User::find(Auth::id());
            $token = $user->createToken('admin-token')->plainTextToken;

            return response()->json([
                'message' => 'Login Berhasil',
                'token' => $token,
                'user' => $user->name
            ], 200);
        }

        return response()->json(['message' => 'Username atau password salah'], 401);
    }

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}
