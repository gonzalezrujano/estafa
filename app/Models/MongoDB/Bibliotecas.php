<?php

namespace App\Models\MongoDB;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Bibliotecas extends Eloquent
{
    protected $connection = 'mongodb';
    protected $table = 'Bibliotecas';

    const CREATED_AT = 'Creado';
    const UPDATED_AT = 'Actualizado';

    //scope para buscar por borrado
    public function scopeBorrado($query, $flag) {
        return $query->where('Borrado', $flag);
    }

    //scope para buscar por activo
    public function scopeActivo($query, $flag) {
        return $query->where('Activo', $flag);
    }

}
