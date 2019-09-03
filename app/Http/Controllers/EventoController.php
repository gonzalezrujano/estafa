<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use MongoDB\BSON\ObjectID;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\MongoDB\Envio;
use App\Models\MongoDB\Evento;
use App\Models\MongoDB\Invitacion;
use App\Models\MongoDB\Bibliotecas;
use App\Http\Requests\ValidateEvento;
use Illuminate\Support\Facades\Validator;
use DB, DataTables, Image, Storage, File, Auth, Mail, QrCode;


//controlador encargado de la seccion de eventos
class EventoController extends Controller {

    // Retorna en orden ascendente todos los eventos que no hayan sido borrados y que esten activos
    public function getEventosNoBorradosActivos(Request $request){
        $eventos = Evento::borrado(false)->activo(true)->app(true)->orderBy('Nombre', 'asc')->get();
        return response()->json(['code'=>200,'eventos'=>$eventos ? $eventos : []]);
    }

    // Retorna el evento basado en su id
    public function getEvento($id){
        $data = Evento::find($id);
        return response()->json($data);
    }

    // Retorna todos los eventos presentes en la base de datos
    public function getTodosLosEventos(){
        $data = Evento::all();
        return response()->json($data);
    }

    // Retorna las invitaciones de un evento
    public function getInvitacion($id){

        $result = [];

        $eve = $id;

        $invitacion = Invitacion::where('Evento_id', new ObjectId($eve))->get();

        foreach ($invitacion as $i){

            if($i->Modo == 'HORIZONTAL'){

                $result[0] = [
                    'PathImg' => $i->PathImg,
                    'PathPdf' => $i->PathPdf
                ];

            }else if($i->Modo == 'VERTICAL'){

                $result[1] = [
                    'PathImg' => $i->PathImg,
                    'PathPdf' => $i->PathPdf
                ];

            }

        }

        $data['invitaciones'] = $result;

        // Retorna una lista de invitaciones
        return response()->json(['code'=>200,'invitaciones'=>$data]);
    }

    public function ajaxContinuar(ValidateQuestionEvent $request){
        $input = $request->all();

        $credenciales = [
            'evento'   => $input['evento'],
            'idevento' => $input['idevento'],
            'sector'   => $input['sector'],
            'fila'     => $input['fila'],
            'asiento'  => $input['asiento'],
            'manual'   => $input['manual']
        ];

        $evento = $input['evento'];
        $idevento = $input['idevento'];

        $validoEvento = $this->isEventoValido($evento, $idevento, Auth::user()->_id, $credenciales);

        if($validoEvento){
            $user = Cliente::find(Auth::user()->_id);
            $user->QuestionEvent = false;
            if($user->save()){
                return response()->json(['code' => 200, 'msj' => 'exito' ]);
            }
            // En caso contrario retorna un mensaje de error al usuario
            return response()->json(['code' => 600, 'msj' => 'Ocurrio un error al seleccionar el evento. Consulte al administrador']);
        }
        return response()->json(['code' => 600, 'msj' => 'Codigo de evento invalido' ]);
    }

    // Verifica si un evento es valido
    public function isEventoValido($evento, $idevento, $user, $data){

        if($evento AND $idevento){
            $bibliotecas = Bibliotecas::where('Evento_id', new ObjectId($evento))->get();
            $ev = Evento::borrado(false)->activo(true)->where('IDEvento', $idevento)->first();

            if($ev){
                $c = Cliente::find($user);
                $c->Evento_id = new ObjectId($ev->_id);
                $c->Empresa_id = new ObjectId($ev->Empresa_id);
                
                $pais = Pais::find($ev->Pais_id);
                $c->GTM = $pais->GTM;
                $c->Archivos = array($ev->Torrent);

                if($c->save()){
                    Auth::guard('web')->login($c);
                    $this->saveAsistenteEvento($user, $data);
                    return true;
                }
                return false;
            }
            return false;
        }else{
            $bibliotecas = Bibliotecas::where('Evento_id', new ObjectId($evento))->get();
            $ev = Evento::find($evento);

            if($ev){
                $c = Cliente::find($user);
                $c->Evento_id = new ObjectId($ev->_id);
                $c->Empresa_id = new ObjectId($ev->Empresa_id);
                $pais = Pais::find($ev->Pais_id);
                $c->GTM = $pais->GTM;
                $c->Archivos = array( $ev->Torrent );

                if($c->save()){
                    $this->saveAsistenteEvento($user, $data);
                    return true;
                }
                return false;
            }
            return false;
        }
    }

    // Metodo para revisar si el evento tiene ubicacion
    public function checkUbicacion(Request $request)
    {
        $input = $request->all();

        $evento = $input['evento'];
        $idevento = $input['idevento'];

        if($idevento){

            $ev = Evento::borrado(false)->activo(true)->where('IDEvento', $idevento)->first();

            if($ev){

                if($ev->Ubicacion == 'GPS'){

                    return response()->json(['code' => 200, 'msj' => 'Evento es de tipo GPS', 'ubicacion' => false ]);

                }else if($ev->Ubicacion == 'MANUAL'){

                    return response()->json(['code' => 200, 'msj' => 'Evento es de tipo MANUAL', 'ubicacion' => true ]);

                }

            }
            // En caso contrario retorna un mensaje de error al usuario
            return response()->json(['code' => 700, 'msj' => 'Codigo de evento invalido', 'ubicacion' => false ]);

        }else{

            $ev = Evento::find($evento);

            if($ev){

                if($ev->Ubicacion == 'GPS'){

                    return response()->json(['code' => 200, 'msj' => 'Evento es de tipo GPS', 'ubicacion' => false ]);

                }else if($ev->Ubicacion == 'MANUAL'){

                    return response()->json(['code' => 200, 'msj' => 'Evento es de tipo MANUAL', 'ubicacion' => true ]);

                }

            }
            // En caso contrario retorna un mensaje de error al usuario
            return response()->json(['code' => 600, 'msj' => 'Error al consultar Evento. Consulte al administrador', 'ubicacion' => false ]);

        }

    }

    public function saveAsistenteEvento($cliente, $data){

        $ubicacion = 'GPS';

        if($data['manual'] == true){
            $ubicacion = 'MANUAL';
        }

        if($data['evento'] AND $data['idevento']){

            $ev = Evento::borrado(false)->activo(true)->where('IDEvento', $data['idevento'])->first();

            $evento = $ev->_id;

        }else{
            $evento = $data['evento'];
        }

        $registro = new AsistenteEvento;
        $registro->Evento_id = new ObjectId($evento);
        $registro->Cliente_id = new ObjectId($cliente);
        $registro->Latitud = '';
        $registro->Longitud = '';
        $registro->Sector = $data['sector'];
        $registro->Fila = $data['fila'];
        $registro->Asiento = $data['asiento'];
        $registro->Fecha = Carbon::now();
        $registro->Ubicacion = $ubicacion;
        $registro->Activo = true;
        $registro->Borrado = false;

        if($registro->save()){
            return true;
        }else{
            return false;
        }
    }

    public function getLatestJobs (Request $request) {
      
      $jobs = Envio::where('Evento', $request->event_id)->where('Fin', '>', (int) $request->current_time)->get();

      return response()->json(['jobs' => $jobs]);
    }

    public function getFilesFromEvent (Request $request, $id) {      
      Validator::make(['id'=> $id], [
        'id' => 'required|exists:Eventos,_id'
      ])->validate();

      $files = Bibliotecas::select('_id', 'NombreCompleto', 'Size', 'Activo', 'MagnetURI')
        ->where('Evento_id', new ObjectId($id))
        ->where('Activo', true)
        ->get();

      return response()->json($files, 200);
    }
}


