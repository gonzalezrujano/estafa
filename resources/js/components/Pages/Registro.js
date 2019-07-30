import React from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";
import axios from 'axios';
import swal from "sweetalert2";
import logoOne from '../../../../public/images/logo-one.png';
import logoFacebook from '../../../../public/images/social/facebook-icon.svg';
import logoGoogle from '../../../../public/images/social/google-icon.svg';
import logoTwitter from '../../../../public/images/social/twitter-icon.svg';
import logoInstagram from '../../../../public/images/social/instagram-icon.svg';
import imgAR from '../../../../public/images/countrys/ar.png';
import imgCL from '../../../../public/images/countrys/es.png';

import reactMobileDatePicker from 'react-mobile-datepicker';
import iconCivil from '../../../../public/images/EstadoCivil01.png';

/**Importando estilos del componente */
import "./css/Login.css"

library.add( faSync);


const Datepicker = reactMobileDatePicker;

/**formato JSON de las fechas */
const dateConfig = {
    'year': {
        format: 'YYYY',
        caption: 'Año',
        step: 1,
    },
    'month': {
        format: 'MM',
        caption: 'Mes',
        step: 1,
    },
    'date': {
        format: 'DD',
        caption: 'Dia',
        step: 1,
    }
};


function convertDate(date, formate) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    return formate
         .replace(/Y+/, year)
         .replace(/M+/, month)
         .replace(/D+/, day)
         .replace(/h+/, hour)
         .replace(/m+/, minute)
         .replace(/s+/, second);
}
export default class RegistroCliente extends React.Component {

    constructor() {
        super();
        this.state = {
            nombre: '',
            apellido: '',
            correo: '',
            password: '',
            pais: '',
            edad:'',
            sexo:'',
            equipo:'',
            url: '/',
            facebook: 'auth/facebook',
            google: 'auth/google',
            isLoading: false,
            clubs:[],
            estadosciviles:  [],
            civil: '',
            time: new Date(),
            isOpen: false,
            fileName: 'Seleccione imagen',
            tipofoto: '',
            foto: '',
            theme: 'default',
            telefono:''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.clubs = this.clubs.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
        this.handleThemeToggle = this.handleThemeToggle.bind(this);
        this.handleSelect = this.handleSelect.bind(this);

    }

    /**
     * Esta funcion se ejecuta al renderi ar por primera ve
     * y tre por ruta api, los estados civiles
     */
    componentWillMount() {
        axios
            .get("/api/usuarios/estado-civil")
            .then(res => {
                console.log(res)
                this.setState({estadosciviles : res.data.estado_civil, isLoading:false})
            })
            .catch(function(error) {
                console.log(error);
            });
    }

    /**
     * Esta funcion se dispara al modificar cada input del form
     * @param {Evento} e 
     */
    handleChange(e) {

        if(e.target.name == 'fileFoto'){

            if(e.target.files.length > 0) {

                console.log(e.target.files[0]);

                let reader = new FileReader();

                reader.onload = (e) => {
                    this.setState({
                        foto: e.target.result
                    })
                };

                reader.readAsDataURL(e.target.files[0]);

                this.setState({ fileName: e.target.files[0].name });
            }

        }else{

            this.setState({
                [e.target.name]: e.target.value
            });
        }



    }

    /**
     * Esta funcion se emite al dar submit del form
     * a continuacion se procede a validar todas las credenciales dadas
     * @param {evento} e 
     */
    handleSubmit(e) {

        e.preventDefault();

        let self = this;

        self.setState({
            isLoading: true
        });

        let {nombre, apellido, correo, password, pais, civil, url, edad, sexo,equipo,time,telefono, tipofoto, foto} = this.state;

        edad=time;

        axios.post('/api/usuarios/registro', { nombre, apellido, correo, password, pais, edad, sexo, equipo , telefono, civil, tipofoto, foto})
            .then(res => {

                self.setState({
                    nombre: '',
                    apellido: '',
                    correo: '',
                    password: '',
                    pais: '',
                    sexo:'',
                    edad:'',
                    equipo:'',
                    civil: '',
                    tipofoto: '',
                    foto: '',
                    fileName: 'Subir Foto (Opcional)',
                    telefono:'',
                    isLoading: false
                });

                let r = res.data;

                if(r.code === 200){

                    swal.fire({
                        title: '<i class="fa fa-check-circle"></i>',
                        text: r.msj,
                        showCancelButton: false,
                        confirmButtonColor: '#343a40',
                        confirmButtonText: 'Ok',
                    }).then((result) => {
                        if (result.value) {

                            this.props.history.push("/");

                        }
                    });


                }else if(r.code === 500){

                    swal({
                        title: '<i class="fas fa-exclamation-circle"></i>',
                        text: r.msj,
                        confirmButtonColor: '#343a40',
                        confirmButtonText: 'Ok'
                    });
                }

            })
            .catch(function (error) {

                if (error.response.status == 422){

                    self.setState({
                        isLoading: false
                    });

                    console.log('errores: ', error.response.data);

                    swal({
                        title: '<i class="fas fa-exclamation-circle"></i>',
                        text: error.response.data,
                        confirmButtonColor: '#343a40',
                        confirmButtonText: 'Ok'
                    });
                }

            });
    }

    clubs(e) {

        this.setState({
            [e.target.name]: e.target.value,
            'equipo': ''
        });

        let self = this;


        var pais = e.target.value;
        var url = this.state.url;
        axios.post('api/usuarios/clubs-perfil', { pais })
            .then(res => {


                let r = res.data;

                if(r.code === 200){
                          this.setState({
                                'clubs': r.datos
                            });  

                }else if(r.code === 500){

                    swal({
                        title: '<i class="fas fa-exclamation-circle"></i>',
                        text: r.msj,
                        confirmButtonColor: '#343a40',
                        confirmButtonText: 'Ok'
                    });
                }

            })
            .catch(function (error) {

                if (error.response.status == 422){

                    self.setState({
                        isLoading: false
                    });

                    console.log('errores: ', error.response.data);

                }

            });
    }

    /**
     * Esta funcion cambia el state para denotar que el modal de fehca esta open
     * @param {*} isOpen 
     */
    handleToggle(isOpen) {
            this.setState({ isOpen });
        };

        /**
         * Esta funcion abre el modal de fecha
         */
        handleThemeToggle() {
            var theme='android-dark';
            this.setState({ theme, isOpen: true });
        };

        /**
         * Esta funcion se emite al elegir una fecha
         * y cambia el state de la variable
         * @param {fecha} time 
         */
        handleSelect(time){
            this.setState({ time, isOpen: false, edad:time });
        };

    render() {

        let {nombre, apellido, correo, password, pais, civil, facebook, google, url, clubs, edad, sexo, equipo, telefono, tipofoto} = this.state;

        let urlFacebook    = url + '/auth/facebook';
        let urlGoogle      = url + '/auth/google';

        let urlTwitter    = url + '/auth/twitter';
        let urlInstagram      = url + '/auth/instagram';
 
        return (
            <div className="abs-center roboto-condensed">
                <div className='box'>

<div className="">
    <img src={logoOne} className="img-fluid logo-box-registro" />
</div>

<div className="text-center">
    <h2>Registro</h2>
</div>

<form method="POST" onSubmit={this.handleSubmit}>

    <div className="input-group mb-4 mt-4">
        <div className="input-group-prepend">
            <i className="fa fa-address-card fa-lg"></i>
        </div>
        <input type="text" id="nombre" name="nombre" value={nombre} onChange={this.handleChange} className="form-control" placeholder="Ingrese su nombre" />
    </div>

    <div className="input-group mb-4 mt-4">
        <div className="input-group-prepend">
            <i className="fa fa-address-card fa-lg"></i>
        </div>
        <input type="text" id="apellido" name="apellido" value={apellido} onChange={this.handleChange} className="form-control" placeholder="Ingrese su apellido" />
    </div>
    <div className="input-group mb-4 mt-4">
        <div className="input-group-prepend">
            <i className="fas fa-calendar-alt fa-lg icono-calendario" ></i>
        </div>
       <a
            className="select-btn sm boton-fecha" 
            onClick={this.handleThemeToggle}>
            {this.state.edad==''?'Ingrese su Fecha de Nacimiento (Opcional)':this.state.time.getDate()+'/'+(this.state.time.getMonth() + 1) +'/'+this.state.time.getFullYear()}
        </a>   
        <Datepicker
        showCaption={true}
        showHeader={true}
        headerFormat={'DD/MM/YYYY'}
        value={this.state.time}
        theme={this.state.theme}
        isOpen={this.state.isOpen}
        onSelect={this.handleSelect}
        onCancel={(e) => this.handleToggle(false)} 
        confirmText="Seleccionar"
        cancelText="Cancelar"
        max={new Date()}
        dateConfig={dateConfig}
        />
    </div>
    <div className="input-group mb-4 mt-4 contenedor-genero" >
        <div className="input-group-prepend">
            <i className="fab fa-ello fa-lg"></i>
        </div>
            <div className="form-check form-check-inline">
            <input className="form-check-input" onChange={this.handleChange} type="radio" name="sexo" id="inlineRadio1x" value="m" checked={sexo === 'm'}  />
            <label className="form-check-label" htmlFor="inlineRadio1x">Masculino</label>
        </div>

        <div className="form-check form-check-inline">
            <input className="form-check-input" onChange={this.handleChange} type="radio" name="sexo" id="inlineRadio2x" value="f" checked={sexo === 'f'}  />
            <label className="form-check-label" htmlFor="inlineRadio2x">Femenino</label>
        </div>

    </div>

    <div className="input-group mb-4 mt-4">
        <div className="input-group-prepend">
            <i className="fa fa-envelope fa-lg"></i>
        </div>
        <input type="text" id="correo" name="correo" value={correo} onChange={this.handleChange} className="form-control" placeholder="Ingrese su correo" />
    </div>

    <div className="input-group mb-4 mt-4">
        <div className="input-group-prepend">
            <i className="fas fa-phone fa-lg"></i>
        </div>
        <input type="number" min="0" max="99999999999" maxLength="11" id="telefono" name="telefono" value={telefono} onChange={this.handleChange} className="form-control" placeholder="Ingrese su telefono (Opcional)" />
    </div>

    <div className="input-group mb-4 mt-4">
        <div className="input-group-prepend input-civil">
            <img src={iconCivil} className="icon-civil" />
        </div>
        <select className="form-control" value={civil} name="civil" id="civil" onChange={this.handleChange}>
            <option  key="0" value=''>Ingrese Estado Civil (Opcional)</option>
            {this.state.estadosciviles.map(function(item){
                return <option  key={item._id} value={item._id}>{item.Nombre}</option>
            })}
        </select>
    </div>


    <div className="input-group mb-4 mt-4">
        <div className="input-group-prepend">
            <i className="fas fa-portrait fa-lg"></i>
        </div>

        <select className="form-control" id="inputGroupSelect02" value={tipofoto} name="tipofoto" onChange={this.handleChange}>
            <option value=''>Seleccione Tipo de foto (Opcional)</option>
            <option value='upload'>Subir Imagen</option>
            <option value='camera'>Tomar Foto</option>
        </select>
    </div>

    {tipofoto == 'upload' ?


        <div className="input-group mb-4 mt-4">
            <div className="input-group-prepend mr-3">
                <i className="far fa-image fa-lg"></i>
            </div>

            <div className="custom-file">
                <input type="file" name="fileFoto" onChange={(e) => this.handleChange(e)}
                       className="custom-file-input" id="customFileLang"/>
                <label className="custom-file-label"
                       htmlFor="customFileLang">{this.state.fileName}</label>
            </div>

        </div>

        : ''

    }

    {tipofoto == 'camera' ?


        <div className="input-group mb-4 mt-4">
            <div className="input-group-prepend mr-3">
                <i className="fas fa-camera fa-lg"></i>
            </div>
            <span className="badge badge-warning">En construccion</span>

        </div>

        : ''

    }

    <div className="input-group mb-4 mt-4">
        <div className="input-group-prepend mr-3">
            <i className="fa fa-key fa-lg"></i>
        </div>
        <input type="password" id="password" name="password" value={password} onChange={this.handleChange} className="form-control" placeholder="Ingrese su password" />
    </div>

    <div className="input-group mb-4 mt-4">
        <div className="input-group-prepend">
            <label className="input-group-text"><i className="fa fa-globe-americas fa-lg"></i></label>
        </div>

        <div className="form-check form-check-inline">
            <input className="form-check-input" onChange={this.clubs} type="radio" name="pais" id="inlineRadio1" value="5caf334dff6eff0ae30e450b" checked={pais === '5caf334dff6eff0ae30e450b'}  />
            <label className="form-check-label" htmlFor="inlineRadio1"><img src={imgAR} className="img-country" /></label>
        </div>

        <div className="form-check form-check-inline">
            <input className="form-check-input" onChange={this.clubs} type="radio" name="pais" id="inlineRadio2" value="5caf37adff6eff0ae30e450d" checked={pais === '5caf37adff6eff0ae30e450d'}  />
            <label className="form-check-label" htmlFor="inlineRadio2"><img src={imgCL} className="img-country" /></label>
        </div>
         <div className="form-check form-check-inline">
            <label className="form-check-label" htmlFor="inlineRadio2">(Opcional)</label>
        </div>

    </div>
    <div className="input-group mb-4 mt-4">
        <div className="input-group-prepend">
            <i className="fas fa-futbol fa-lg"></i>
        </div>

          <select className="form-control" id="inputGroupSelect02" value={equipo} name="equipo" id="equipo" onChange={this.handleChange}>
            <option  key="-1" value=''>Equipos de futbol (Opcional)</option>
              { this.state.clubs.length > 0 ?
                  <option  key="0" value='1000'>Ninguno</option>
                  : ''
              }
            {this.state.clubs.map(function(item){
                return <option  key={item.id} value={item.id}>{item.Nombre}</option>
            })}
          </select>
    </div>


    { this.state.equipo!='' ?
        <div className="text-center input-equipo">
        <img src={'/images/clubs/'+this.state.equipo+'.png'} className="imagen-equipo"/>
    </div>
    :''}
    <div className="text-center">
        <button type="submit" className="btn btn-negro black btn-box-index">
            { this.state.isLoading ? <FontAwesomeIcon icon="sync" size="lg" spin /> : '' }
            &nbsp;&nbsp; Registrar
        </button>
    </div>
     <div className="text-center roboto-condensed text-can-login-social">
        <p  className="alternativo-registro">o puedes registrarte con</p>
    </div>

   <div className="text-center mb-4">

        <a href={urlFacebook}>
            <img src={logoFacebook} className="img-fluid icon-social mr-3" />
        </a>

        <a href={urlGoogle}>
            <img src={logoGoogle} className="img-fluid icon-social mr-3" />
        </a>
        <a href={urlTwitter}>
            <img src={logoTwitter} className="img-fluid icon-social mr-3" />
        </a>

        <a href={urlInstagram}>
            <img src={logoInstagram} className="img-fluid icon-social" />
        </a>

    </div>

    <div className="text-center">
    <Link to="/">
            <button
                type="button"
                className="btn btn-rojo btn-box-index"
            >
                Volver
            </button>
        </Link>
    </div>

   


</form>

</div>
            </div>
            
        );
    }
}



