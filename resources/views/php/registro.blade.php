@extends('layouts.master')

@section('content')

    <div id="registro-cliente" data-facebook="{{ url('auth/facebook') }}" data-google="{{ url('auth/google') }}" data-url="{{ url('/') }}" data-estadosciviles="{{ json_encode($civiles) }}"  ></div>

@endsection

@section('javascript')

@endsection