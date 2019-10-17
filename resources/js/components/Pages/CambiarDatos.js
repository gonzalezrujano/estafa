import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import swal from "sweetalert2";
import imgAR from '../../../../public/images/countrys/ar.png';
import imgCL from '../../../../public/images/countrys/es.png';
import iconCivil from '../../../../public/images/EstadoCivil01.png';
import reactMobileDatePicker from 'react-mobile-datepicker';
import ProfileImage from './../atoms/ProfileImage';
import moment from 'moment';
import { connect } from 'react-redux';

/** Importando estilos css del componente */
import "../../../css/components/CambiarDatos.css"

const Datepicker = reactMobileDatePicker;

/**
 * Creando el json para trabajar con las fechas
 */
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

class CambiarDatos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: props.url,
      nombre: '',
      apellido: '',
      sexo: '',
      FechaNacimiento: '',
      equipo: '',
      civil: '',
      clubs:[],
      estadosciviles: [],
      correo: '',
      cuenta: '',
      api_token: localStorage.getItem("api_token"),
      pais: '',
      paises: [],
      telefono: '',
      fileName: 'Seleccione imagen',
      tipofoto: '',
      foto: '',
      fotonew:'',
      flagPais: '',
      isImageLoaded: false,
      isLoading: true
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSuccessfulUpdate = this.handleSuccessfulUpdate.bind(this);
    this.handleErrorOnUpdate = this.handleErrorOnUpdate.bind(this);
    this.clubs = this.clubs.bind(this);
    this.clubs2 = this.clubs2.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleThemeToggle = this.handleThemeToggle.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.chooseImageSource = this.chooseImageSource.bind(this);
    this.transferId = 1;
  }

  /**
   * Componente que se carga al renderi ar por primera ve
   * aqui traigo la informacion del usuario logeado
   */
  componentDidMount() {
    axios.get("api/clientes/id/" + this.props.userId, {
      headers: {
        Authorization: this.state.api_token
      }
    })
    .then(res => {
      const { cliente, code, msj, civiles } = res.data;

      if (code === 200) {
        this.setState({
          nombre: cliente.Nombre,
          apellido: cliente.Apellido,
          correo: cliente.Correo,
          sexo: cliente.Sexo,
          equipo: cliente.Equipo,
          fechaNacimiento: moment(cliente.FechaNacimiento, 'DD/MM/YYYY').toDate(),
          civil: cliente.EstadoCivil_id,
          cuenta: cliente.TipoCuenta,
          pais: cliente.Pais_id,
          estadosciviles: civiles,
          telefono: cliente.Telefono,
          foto: cliente.Foto !== '' ? `storage/${cliente.Foto}` : cliente.Foto,
          isLoading: false
        });

        if (cliente.Pais_id) {
          this.clubs2(cliente.Pais_id);
        }

      } else if (code === 500){
        console.log(msj);
      }
    })
    .catch(error => console.log(error));
  }

  chooseImageSource (e) {
    Cordova.exec(buttonIndex => {
      if (buttonIndex === 0)
        return;
      
      const source = buttonIndex === 2 ? (
        navigator.camera.PictureSourceType.PHOTOLIBRARY
      ) : (
        navigator.camera.PictureSourceType.CAMERA
      );

      navigator.camera.getPicture(imageData => {
        window.resolveLocalFileSystemURL(imageData, fileEntry => {
          console.log(fileEntry.toInternalURL());
          this.setState({
            isImageLoaded: true,
            foto: fileEntry.toInternalURL(),
          })
        }, console.log);
      }, console.log, {
        sourceType: source,
        allowEdit: true,
        madiaType: navigator.camera.MediaType.PICTURE,
        saveToPhotoAlbum: true,
      });
    }, null, 'Notification', 'confirm', [
      '¿De donde desea tomar la imagen?',
      'Buscar Foto',
      ['Tomar Foto', 'Galería']
    ])
  }

  handleChange(e) {
    this.setState({
        [e.target.name]: e.target.value
    });
  }

  /**
   * esta funcioncion se ejecuta al cargar por los componentes
   * trae como resultado la lista de clubs de espa;a/argentina
   * @param {evento} e 
   */
  clubs(e) {
    this.setState({
      [e.target.name]: e.target.value,
      'equipo': ''
    });

    let pais = e.target.value;

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
      .catch(error => {
        if (error.response.status == 422){
          this.setState({
              isLoading: false
          });

          console.log('errores: ', error.response.data);
        }
      });
  }

  /**
   * esta funcioncion se ejecuta al cargar por los componentes
   * trae como resultado la lista de clubs de espa;a/argentina
   * @param {evento} pais 
   */
  clubs2(pais) {
    axios.post('api/usuarios/clubs-perfil', { pais })
      .then(res => {
        let r = res.data;

        if(r.code === 200){
          this.setState({
            'clubs': r.datos
          });

        }else if (r.code === 500) {
          swal({
            title: '<i class="fas fa-exclamation-circle"></i>',
            text: r.msj,
            confirmButtonColor: '#343a40',
            confirmButtonText: 'Ok'
          });
        }
      })
      .catch(error => {
        if (error.response.status == 422){
          this.setState({
            isLoading: false
          });

          console.log('errores: ', error.response.data);
        }
      });
  }

  /**
   * Esta funcion se activa al dar click fuera del modal de fecha
   * @param {*} isOpen 
   */
  handleToggle(isOpen) {
      this.setState({ isOpen });
  };

  /**
   * Esta funcion abre el modal de fechas al dar click en fecha
   */
  handleThemeToggle() {
      var theme='android-dark';
      this.setState({ theme, isOpen: true });
  };

  /**
   * Esta funcion recibe la fecha al seleccionar en el modal de fechas
   * @param {fecha} time 
   */
  handleSelect(time){
      this.setState({ fechaNacimiento: time, isOpen: false, FechaNacimiento:time });
  };

  /**
   * Esta funcion se encarga de enviar la peticion API
   * para actuali ar el perfil del cliente
   * @param {evento} e 
   */
  handleSubmit(e) {
    e.preventDefault();

    this.setState({ isLoading: true });

    const birthdate = this.state.fechaNacimiento;
    const birthdateString = `${birthdate.getDate()}/${birthdate.getMonth() + 1}/${birthdate.getFullYear()}`;

    let data = {
      userId: this.props.userId,
      countryId: this.state.pais,
      gender: this.state.sexo,
      phone: this.state.telefono,
      birthdate: birthdateString,
      teamId: this.state.equipo,
      maritalStatus: this.state.civil,
      name: this.state.nombre,
      avatarURL: this.state.foto,
      lastname: this.state.apellido,
    };

    if (this.state.isImageLoaded) {
      const { foto } = this.state;
      /**
       * The cordova sends the information as it was a normal form, not a JSON,
       * that means the values that are null in frontend, are "null" in backend,
       * taking those as non-null values  
       */
      Object.keys(data).forEach(key => {
        if (data[key] === null) 
          data[key] = '';
      });

      /**
       * I use this syntax because of a bug where the
       * FileTransfer constructor is undefined
       */
      Cordova.exec(this.handleSuccessfulUpdate, this.handleErrorOnUpdate,
        'FileTransfer',
        'upload',
        [
          foto, // filePath
          'http://192.168.1.5:8001/api/clientes/editar/perfil', // Server
          'profilePicture', // fileKey
          foto.substr(foto.lastIndexOf('/') + 1), // fileName
          '', // mimeType
          data, // params
          false, // trustAllHost
          false, // chunckedMode
          { 
            Authorization: localStorage.getItem('api_token'),
            'X-Requested-With': 'XMLHttpRequest'
          }, // headers
          this.transferId, // _id
          'POST', // httpMethod
        ]
      );
    
    } else {      
      axios.post('api/clientes/editar/perfil', data, {
        headers: {
          Authorization: localStorage.getItem('api_token')
        }
      })
      .then(res => this.handleSuccessfulUpdate({ 
        response: JSON.stringify(res.data),
      }))
      .catch(this.handleErrorOnUpdate)
      .then(() => this.setState({ isLoading: false }))
    }
  }

  handleSuccessfulUpdate (res) {
    if (res.response) {
      const client = JSON.parse(res.response);
      
      this.setState({
        isLoading: false,
        foto: client.Foto !== '' ? `storage/${client.Foto}` : '',
      });

      this.transferId += 1;
    }
  }

  handleErrorOnUpdate (err) {
    console.log('error', err);
  }

  render () {
    let tagClass;
    let {nombre, apellido, correo, cuenta, pais, telefono, sexo, civil, equipo, foto, fechaNacimiento, tipofoto} = this.state;

    if(cuenta == 'ONE'){
        tagClass = 'badge badge-one';
    }else if(cuenta == 'Facebook'){
        tagClass = 'badge badge-facebook';
    }else if(cuenta == 'Google'){
        tagClass = 'badge badge-google';
    }

    if (this.state.isLoading)
      return(
        <div className="abs-center">
          <FontAwesomeIcon icon="sync" size="lg" spin />
        </div>
      );
      
    return (
      <div>
        <form method="POST" className="p-4" onSubmit={this.handleSubmit}>
          <div className="text-center my-2">
            <ProfileImage 
              size={150} 
              image={foto === '' ? null : foto}
              removable={true}
              onClick={this.chooseImageSource}
              onRemove={e => this.setState({ foto: null, isImageLoaded: false })}
            />
          </div>
          <div className="input-group mb-4">
            <div className="input-group-prepend">
              <i className="fa fa-address-card fa-lg"></i>
            </div>
            <input 
              type="text" 
              name="nombre" 
              value={nombre} 
              className="form-control" 
              onChange={this.handleChange}
              required
            />
          </div>
          <div className="input-group mb-4">
            <div className="input-group-prepend">
              <i className="fa fa-address-card fa-lg"></i>
            </div>
            <input 
              type="text" 
              name="apellido"
              value={apellido} 
              className="form-control" 
              onChange={this.handleChange} 
              required
            />
          </div>
          <div className="input-group mb-4 mt-4">
            <div className="input-group-prepend">
              <i className="fas fa-calendar-alt fa-lg icono-fecha"></i>
            </div>
            <input 
              readOnly
              id="fecha" 
              type="text" 
              name="fecha"
              style={{ borderStyle: 'solid' }}
              onClick={this.handleThemeToggle}
              value={fechaNacimiento.getDate()+'/'+(fechaNacimiento.getMonth() + 1) +'/'+fechaNacimiento.getFullYear()} 
              className="form-control"
            />
            <Datepicker
              theme="dark"
              max={new Date()}
              showHeader={true}
              showCaption={true}
              cancelText="Cancelar"
              dateConfig={dateConfig}
              confirmText="Seleccionar"
              isOpen={this.state.isOpen}
              headerFormat={'DD/MM/YYYY'}
              onSelect={this.handleSelect}
              value={this.state.fechaNacimiento}
              onCancel={(e) => this.handleToggle(false)}
            />
          </div>
          <div className="input-group mb-4">
            <div className="input-group-prepend">
              <i className="fa fa-envelope fa-lg"></i>
            </div>
            <input 
              readOnly 
              type="text" 
              id="correo" 
              name="correo" 
              value={correo}
              className="form-control"  
              style={{ borderStyle: 'solid' }}
            />
          </div>
          <div className="input-group mb-4 mt-4">
            <div className="input-group-prepend">
              <i className="fab fa-ello fa-lg"></i>
            </div>
            <div className="form-check form-check-inline">
              <input 
                value="m" 
                name="sexo" 
                type="radio" 
                id="inlineRadio1x" 
                checked={sexo === 'm'}
                className="form-check-input" 
                onChange={this.handleChange} 
              />
              <label className="form-check-label" htmlFor="inlineRadio1x">Masculino</label>
            </div>
            <div className="form-check form-check-inline">
              <input 
                value="f" 
                name="sexo" 
                type="radio"
                id="inlineRadio2x" 
                checked={sexo === 'f'}
                className="form-check-input" 
                onChange={this.handleChange} 
              />
              <label className="form-check-label" htmlFor="inlineRadio2x">Femenino</label>
            </div>
          </div>
          <div className="input-group mb-4">
            <div className="input-group-prepend">
              <i className="fa fa-user-circle fa-lg"></i>
            </div>
            <span className={tagClass}>Cuenta {cuenta}</span>
          </div>
          <div className="input-group mb-4 mt-4">
            <div className="input-group-prepend input-civil">
              <img src={iconCivil} className="icon-civil" />
            </div>
            <select className="form-control" value={civil} name="civil" id="civil" onChange={this.handleChange}>
              <option  key="0" value=''>Ingrese Estado Civil (Opcional)</option>
              {this.state.estadosciviles.map(item => (
                <option key={item._id} value={item._id}>{item.Nombre}</option>
              ))}
            </select>
          </div>
          <div className="input-group mb-4 mt-4">
            <div className="input-group-prepend">
              <i className="fas fa-phone fa-lg"></i>
            </div>
            <input 
              type="number" 
              min="0" max="99999999999" 
              maxLength="11" 
              id="telefono" 
              name="telefono" 
              value={telefono} 
              onChange={this.handleChange} 
              className="form-control" 
              placeholder="Ingrese su telefono (Opcional)" 
            />
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
          </div>
          <div className="input-group mb-4 mt-4">
            <div className="input-group-prepend">
              <i className="fas fa-futbol fa-lg"></i>
            </div>
            <select className="form-control" id="inputGroupSelect02" value={equipo} name="equipo" id="equipo" onChange={this.handleChange}>
              <option  value=''>Equipos de futbol</option>
              { this.state.clubs.length > 0 &&
                <option  key="0" value='1000'>Ninguno</option>
              }
              {this.state.clubs.map(item => (
                <option  key={item.id} value={item.id}>{item.Nombre}</option>
              ))}
            </select>
          </div>
          { this.state.equipo !== '' &&
            <div className="text-center contenedor-imagen-equipo" >
              <img className="imagen-equipo" src={'/images/clubs/'+this.state.equipo+'.png'} />
            </div>
          }
          <div className="text-center">
            <button type="submit" className="btn btn-negro black btn-box-index">
              Actualizar
            </button>
          </div>
        </form>
      </div>
    );
  }
}

const mapDispatchToProps = state => ({
  userId: state.auth.user.id,
});

export default connect(mapDispatchToProps)(CambiarDatos);