<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\MongoDB\Cliente;
use MongoDB\BSON\ObjectId;
use Socialite;
use Exception;

//controlador encargado de la autenticacion de facebook y google
class SocialAuthController extends Controller
{

    //metodo para reedirigir a facebook o google
    public function redirect($provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    //metodo donde se devuelve la respuesta de google y facebook
    public function callback($provider)
    {

       try{
           //obtengo los datos del usuario
           $user = Socialite::driver($provider)->user();

        } catch (\Exception $e) {

            //si oucrre un error redirijo a la pagina principal
            return redirect('/');
        }
        
        $existingUser = Cliente::where('Correo', $user->email)->first();

        if($existingUser){

            if($existingUser->TipoCuenta == ucwords($provider)){

                $existingUser->QuestionEvent = true;

                if($existingUser->save()){

                    Auth::login($existingUser);

                }else{
                    return redirect()->route('login')->with('error', 'Error al iniciar sesion. Consulte al administrador.');
                }


                //genero log de inicio de sesion
                //$log = generateLog('inicio', 'web');

            }else{

                return redirect()->route('login')->with('error', 'Correo ya registrado');
            }

        } else {

            $registro = new Cliente;
            $registro->Nombre              = $user->name;
            $registro->Apellido            = '';
            $registro->Sexo                = '';
            $registro->FechaNacimiento     = '';
            $registro->Equipo              = '';
            $registro->Correo              = strtolower($user->email);
            $registro->Telefono            = '';
            $registro->Password            = '';
            $registro->TipoCuenta          = ucwords($provider);
            $registro->ProviderID          = $user->id;
            $registro->Pais_id             = '';
            $registro->EstadoCivil_id      = new ObjectId('5cbad5c4cf88fb319a3b5503');
            $registro->TipoFoto            = '';
            $registro->Foto                = '';
            $registro->Borrado             = false;
            $registro->Activo              = true;
            $registro->QuestionEvent       = true;

            $registro->save();

            Auth::login($registro);

            //genero log de inicio de sesion
           // $log = generateLog('inicio', 'web');

        }

        return response()->json([
            'code' => 200, 
            'msj' => 'exito', 
            'tipo' => 'one' , 
            'userid' => $user->_id, 
            'access_token' => $apiToken
        ]);

    }


}
