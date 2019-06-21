<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});


// Permite difinir los puntos de entrada para los endpoints de usuarios
Route::group(['prefix' => 'usuarios'], function() {
		Route::post('/login', 'LoginController@ajaxPostLogin');
});

// Permite difinir los puntos de entrada para los endpoints de eventos
Route::group(['prefix' => 'eventos'], function() {
    Route::get('/', 'EventoController@evento');
    Route::post('/check_ubicacion', 'QuestionEventController@ajaxEventoCheckUbicacion');
});

// Permite difinir los puntos de entrada para los endpoints de eventos
Route::group(['prefix' => 'clientes'], function() {
		Route::get('/estado-civil', 'RegistroController@estado_civil');
    Route::post('/registro', 'RegistroController@ajaxPostRegistro');
    Route::post('/club', 'RegistroController@ajaxPostClubs');
});