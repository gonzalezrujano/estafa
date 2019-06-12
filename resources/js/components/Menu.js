import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import swal from "sweetalert2";
import CambiarDatos from "./Perfil/CambiarDatos";
import CambiarClave from "./CambiarClave";

library.add( faSync);

export default class Menu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tipocuenta: props.tipocuenta,
            menuapp: JSON.parse(props.menuapp),
            pais: props.pais,
            url: props.url,
            fotoproducto: props.fotoproducto == "1" ? true : false
        };

        this.handleLogout = this.handleLogout.bind(this);
        this.getDetener = this.getDetener.bind(this);

    }

    getDetener(){

        swal({
            title: '<i class="fa fa-exclamation-triangle"></i>',
            text: 'Se ha detenido los procesos interno de la aplicación',
            confirmButtonColor: '#343a40'
        }).then(function(value) {
           // cumplimiento
           window.app.detener();
          }, function(reason) {
          // rechazo
        });

    }

    handleLogout(e){

        let urlLogout = this.state.url+'/logout';
        e.preventDefault();
        localStorage.setItem('cache','false');
        window.location.href = urlLogout;

    }

    appendChild(){
        const element = document.getElementById('inicio');
    }

    handleMenuClick(e) {
        e.preventDefault();
        const target_id = e.target.id
        const div_contenido = document.getElementById('content');
        const boton = document.getElementById('inicio');
        const props = Object.assign({}, div_contenido.dataset);

        if(target_id == "show"){
            // se limpia la pantalla al seleccionar Show en el menú
            div_contenido.innerHTML="";
            // se muestra el botón Activar Flash
            boton.style.display = "block";
        }else if(target_id == "perfil"){
            // se oculta el botón al mostrar el componente CambiarDatos
            boton.style.display = "none";
            // se oculta el menú al mostrar el componente CambiarDatos
            $('.navbar-toggler').click();
            // se renderiza el componente CambiarDatos
            ReactDOM.render(<CambiarDatos {...props} />, div_contenido);
        }else if(target_id == "cambiar-password"){
            // se oculta el botón al mostrar el componente CambiarClave
            boton.style.display = "none";
            // se oculta el menú al mostrar el componente CambiarClave
            $('.navbar-toggler').click();
            // se renderiza el componente CambiarClave
            ReactDOM.render(<CambiarClave {...props} />, div_contenido);
        }
    }

    render() {

        let tipoCuenta = this.state.tipocuenta;
        let menuapp = this.state.menuapp;
        let url = this.state.url;

        let urlInicio       = url + '/';
        let urlPerfil       = url + '/cliente/perfil';
        let urlCambiarClave = url + '/cliente/cambiar/password';
        let urlChatSoporte  = url + '/chat/soporte';
        let urlInvitacion   = url + '/invitacion';

        let changePassword =  <li className="nav-item"><a className="nav-link" href={urlCambiarClave}><i className="fas fa-lock fa-lg"></i>&nbsp;&nbsp; Contraseña</a></li>;

        return (

            <ul className="navdrawer-nav roboto-condensed">

                <li className="nav-item">
                    <a className="nav-link" id="show" href="#" onClick={this.handleMenuClick}><i
                        className="fas fa-home fa-lg"></i>&nbsp;&nbsp; Show</a>
                </li>
                 <li className="nav-item">
                    <a className="nav-link" id="perfil" href="#" onClick={this.handleMenuClick}><i
                        className="fas fa-cog fa-lg"></i>&nbsp;&nbsp;  Perfil</a>
                </li>

                <li className="nav-item">
                    <a className="nav-link" href="#"><i
                        className="fab fa-weixin fa-lg"></i>&nbsp;&nbsp; Notificaciones</a>
                </li>

                {menuapp.includes('5cc47b4af39c6a0a4f6a4de4') ?

                    <li className="nav-item">
                        <a className="nav-link" href={urlInvitacion} ><i
                            className="fas fa-user-friends fa-lg"></i>&nbsp;&nbsp; Invitación</a>
                    </li>

                    : ''

                }

                <li className="nav-item">
                    <a className="nav-link" href="#" onClick={this.getDetener}><i
                        className="fas fa-power-off fa-lg"></i>&nbsp;&nbsp; Detener</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#" id="cambiar-password" onClick={this.handleMenuClick}>
                        <i className="fas fa-lock fa-lg"></i>&nbsp;&nbsp; Contraseña</a>
                </li>;
                <li className="nav-item">
                    <a className="nav-link" href="#" onClick={this.handleLogout}><i
                        className="fas fa-sign-out-alt fa-lg"></i>&nbsp;&nbsp; Salir</a>
                </li>

            </ul>
        );
    }
}

if (document.getElementById('menu')) {

    const element = document.getElementById('menu');

    const props = Object.assign({}, element.dataset);

    ReactDOM.render(<Menu {...props} />, element);
}
