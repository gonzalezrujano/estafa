
window._ = require('lodash');

/**
 * We'll load jQuery and the Bootstrap jQuery plugin which provides support
 * for JavaScript based Bootstrap features such as modals and tabs. This
 * code may be modified to fit the specific needs of your application.
 */

try {
    window.Popper = require('popper.js').default;
    window.$ = window.jQuery = require('jquery');

    require('bootstrap');
} catch (e) {}

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

window.axios = require('axios');

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

window.axios.defaults.baseURL = document.head.querySelector('meta[name="api-base-url"]').content;

/**
 * Next we will register the CSRF Token as a common header with Axios so that
 * all outgoing HTTP requests automatically have it attached. This is just
 * a simple convenience so we don't have to attach every token manually.
 */

let token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

// import Echo from 'laravel-echo'

// window.Pusher = require('pusher-js');

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: process.env.MIX_PUSHER_APP_KEY,
//     cluster: process.env.MIX_PUSHER_APP_CLUSTER,
//     encrypted: true
// });

window.app = {
    datos:{},
    servicio:false,
    preguntasGPS:0,
    pedidos:[],gpsintervalo:60,url:'',cache:true,flash:false,comandos:[],
    animacionInicio:'',animacionFin:'',
    animacionInicioFLH:'',animacionFinFLH:'',
    animacionFinFLHEstado:0,
    animacionInicioVivo:false,
    animacionInicioVivoFLH:false,
    animacionInicioVivoMUL:false,
    gtm:' GMT'+window.Laravel.gtm,
    topic:'sampletopic',
    url:'',
    isCordovaIos : function () {
            return (navigator.userAgent.match(/(Ios)/)&&navigator.userAgent.match(/(Cordova)/));
        },
    isCordova : function () {
            return (navigator.userAgent.match(/(Cordova)/));
        },
    // Application Constructor
    initialize: function(datos) {
        this.datos=datos;
      //  console.log('iniciar');
       // console.log(this.datos);
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    enviarUbicacion:function (latitude,longitude) {
           //url test http://ricardo-pc/OnePWA/public/ajax-set-traking
           var fecha = new Date();
      var datos={clientId:window.Laravel.telefono,location:{latitude:latitude,longitude:longitude},fecha:fecha };
    		cordova.plugins.CordovaMqTTPlugin.publish({
				   topic:"/"+window.Laravel.empresa+"/"+window.Laravel.evento+"/Coordenadas",
				   payload:JSON.stringify(datos),
				   qos:0,
				   retain:false,
				   success:function(s){
				 console.log(s);
				   },
				   error:function(e){
				 console.log(s);
				   }
				});
    },
    coordenadas:function() {
      window.app.reloj();
     setInterval(window.app.reloj,window.app.gpsintervalo*1000);
    },
    reloj:function() {
                       if(window.app.isCordovaIos()){
                           //console.log("GPS activado directo");
                              navigator.geolocation.getCurrentPosition(function (position) {
                                  window.app.enviarUbicacion(position.coords.longitude,position.coords.latitude);
                              }, function (argument) {
                                cordova.plugins.notification.local.schedule({
                                    id:1,
                                    title: 'ONE Show',
                                    text: 'Debe activar el GPS para continuar',
                                    icon: 'res://icon.png',
                                    smallIcon: 'res://icon.png'
                                });
                              })
                   }else{
                    //window.location.href=url+"/10.322/-68.783";
                    //return false; 
                  navigator.geolocation.activator.askActivation(function(response) {
                            //console.log("GPS activado");
                              navigator.geolocation.getCurrentPosition(
                                  function (position) {
                                    window.app.enviarUbicacion(position.coords.longitude,position.coords.latitude);
                              }, function (argument) {
                                cordova.plugins.notification.local.schedule({
                                    id:1,
                                    title: 'ONE Show',
                                    text: 'No se puede activar el GPS para continuar',
                                    icon: 'res://icon.png',
                                    smallIcon: 'res://icon.png'
                                });
                              }); 
                        }, function(errorask) {
                          console.log(errorask);
                             cordova.plugins.notification.local.schedule({
                                  id:1,
                                  title: 'ONE Show',
                                  text: 'No se puede activar el GPS para continuar',
                                  icon: 'res://icon.png',
                                  smallIcon: 'res://icon.png'
                              });
                            });
                  }
    },
    ping:function() {
      window.app.relojPing();
     setInterval(window.app.relojPing,5*60*1000);
    },
    relojPing:function() {
       var fecha = new Date();
      var datos={clientId:window.Laravel.telefono,fecha:fecha };
        cordova.plugins.CordovaMqTTPlugin.publish({
           topic:"/"+window.Laravel.empresa+"/"+window.Laravel.evento+"/Pings",
           payload:JSON.stringify(datos),
           qos:0,
           retain:false,
           success:function(s){
         console.log(s);
           },
           error:function(e){
         console.log(s);
           }
        });                        
    },
    onDeviceReady: function() {
    // Set the SNTP server and timeout
    cordova.plugins.sntp.setServer("time1.google.com", 10000);
    if(window.Laravel.empresa==undefined||window.Laravel.empresa==null){
      window.Laravel.empresa='empresa';
    }
    if(window.Laravel.evento==undefined||window.Laravel.evento==null){
      window.Laravel.evento='evento';
    }
    window.app.topic="/"+window.Laravel.empresa+"/"+window.Laravel.evento;

    console.log('ready');
    var routerObject={};  
    cordova.plugins.CordovaMqTTPlugin.connect({
    url:"tcp://node69345-mqttone.mircloud.host", //a public broker used for testing purposes only. Try using a self hosted broker for production.
    port:11273,
    clientId:window.Laravel.cliente,
    connectionTimeout:3000,
    willTopicConfig:{
        qos:0, //default is 0
        retain:true, //default is true
        topic:window.app.topic,
        payload:"test1"
    },
    username:null,
    password:null,
    keepAlive:60,
    isBinaryPayload: false, //setting this 'true' will make plugin treat all data as binary and emit ArrayBuffer instead of string on events
    success:function(s){
    	console.log(s);
        console.log("connect success");
        //Simple subscribe
            cordova.plugins.CordovaMqTTPlugin.subscribe({
               topic:window.app.topic,
               qos:0,
              success:function(s){
                console.log(s);
              },
              error:function(e){
             console.log(s);
              }
            });
            if(window.Laravel.telefono!=null&&window.Laravel.telefono!=undefined){
              window.app.coordenadas();  
            }
            window.app.ping();
            console.log("ping");
            

            var multi ="/"+window.Laravel.empresa+"/"+window.Laravel.evento+"/Multimedia";
            //\Empresa\Evento\Multimedia se suscribe al envento de multimedia
            cordova.plugins.CordovaMqTTPlugin.subscribe({
               topic:multi,
               qos:0,
              success:function(s){
             console.log(s);
              },
              error:function(e){
             console.log(s);
              }
            });
            console.log("xdmultimedia");
            
            //escucha los enventos de canale multimedia
            cordova.plugins.CordovaMqTTPlugin.listen(multi,function(payload,params){
              console.log("multimedia");
              //Callback:- (If the user has published to /topic/room/hall)
              //payload : contains payload data
              //params : {singlewc:room,multiwc:hall}
            if(payload!=undefined&&payload.split(",").length>1){
              var datos=payload.split(",");
              if(datos[0]=='TTR'){
                var url=datos[1];
                var urls=url.split("+");
                //'magnet:?xt=urn:btih:0c5207462d0d2ba839b4d8d4bfa3686689738d63&dn=240192_splash.png&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com'
                  for (var i = urls.length - 1; i >= 0; i--) {                   
                    window.app.torrent(urls[i]);
                  }
    
              }
              
            }
        
              console.log(payload);
              console.log(params);
            });
            //escucha un canale simple
            cordova.plugins.CordovaMqTTPlugin.listen(window.app.topic,function(payload,params){
            	console.log("testxd2");
              //Callback:- (If the user has published to /topic/room/hall)
              //payload : contains payload data
              //params : {singlewc:room,multiwc:hall}
            if(payload!=undefined&&payload.split(",").length>1){
              var datos=payload.split(",");



              
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; 
            var yyyy = today.getFullYear();
            //window.app.animacionActual=0;
            //window.app.lanzarElDia(new Date(yyyy+'-'+mm+'-'+dd+' '+datos[1]), window.app.tarea);


            if(datos[0]=='FLH'){
            window.app.animacionFinFLHEstado=0;
            window.app.animacionFLH=datos[1];
            window.app.animacionInicioFLH=datos[2];
            window.app.animacionFinFLH=datos[3];
            if(window.app.animacionInicioFLH=='99:99:99'){
              window.app.animacionInicioFLH=today.getHours()+':'+today.getMinutes()+':'+today.getSeconds();
              window.app.animacionInicioVivoFLH=true;
            }
            cordova.plugins.sntp.getClockOffset(
                function(offset) {
                    console.log("System clock offset is:", offset);
                    var diferenciaSegundos= offset/1000;
                    var fecha =new Date(yyyy+'-'+mm+'-'+dd+' '+window.app.animacionInicioFLH+window.app.gtm);
                    if(diferenciaSegundos>0||diferenciaSegundos<0){
                      fecha.setSeconds(diferenciaSegundos);
                    }
                    window.app.lanzarElDia(fecha, window.app.tareaFLH);

                },
                function(errorMessage) {
                    console.log("I haz error:", errorMessage);
                }
            );

            }
            if(datos[0]=='COL'){
            window.app.animacion=datos[1].split("+");
            window.app.animacionActual=0;
            window.app.animacionInicio=datos[2];
            window.app.animacionFin=datos[3];
            if(window.app.animacionInicio=='99:99:99'){
              window.app.animacionInicio=today.getHours()+':'+today.getMinutes()+':'+today.getSeconds();
              window.app.animacionInicioVivo=true;
            }
            cordova.plugins.sntp.getClockOffset(
                function(offset) {
                    console.log("System clock offset is:", offset);
                    var diferenciaSegundos= offset/1000;
                    var fecha =new Date(yyyy+'-'+mm+'-'+dd+' '+window.app.animacionInicio+window.app.gtm);
                    if(diferenciaSegundos>0||diferenciaSegundos<0){
                      fecha.setSeconds(diferenciaSegundos);
                    }
                    window.app.lanzarElDia(fecha, window.app.tareaCOL);
                },
                function(errorMessage) {
                    console.log("I haz error:", errorMessage);
                }
            );

            }

            if(datos[0]=='MUL'){//MUL,
            window.app.animacionMUL=datos[1].split("+");
            window.app.animacionActualMUL=0;
            window.app.animacionInicioMUL=datos[2];
            window.app.animacionFinMUL=datos[3];
            if(window.app.animacionInicioMUL=='99:99:99'){
              window.app.animacionInicioMUL=today.getHours()+':'+today.getMinutes()+':'+today.getSeconds();
              window.app.animacionInicioVivoMUL=true;
            }
            cordova.plugins.sntp.getClockOffset(
                function(offset) {
                    console.log("System clock offset is:", offset);
                    var diferenciaSegundos= offset/1000;
                    var fecha =new Date(yyyy+'-'+mm+'-'+dd+' '+window.app.animacionInicioMUL+window.app.gtm);
                    if(diferenciaSegundos>0||diferenciaSegundos<0){
                      fecha.setSeconds(diferenciaSegundos);
                    }
                    window.app.lanzarElDia(fecha, window.app.tareaMUL);
                },
                function(errorMessage) {
                    console.log("I haz error:", errorMessage);
                }
            );

            }

            //window.app.comandos=
            }
             
               console.log(payload);
              console.log(params);
            });


    },
    error:function(e){
        console.log(e);
        console.log("connect error");
    },
    onConnectionLost:function (e){
    	console.log(e);
        console.log("disconnect");
    },
    routerConfig:{
        publishMethod:"emit", //refer your custom router documentation to get the emitter/publishing function name. The parameter should be a string and not a function.
        useDefaultRouter:true //Set false to use your own topic router implementation. Set true to use the stock topic router implemented in the plugin.
    }
});



window.app.sincronizarArchivos();


/*
document.addEventListener("connected",function(e){
 console.log(e.type)
},false)




*/

/*
cordova.plugins.CordovaMqTTPlugin.publish({
   topic:window.app.topic,
   payload:"hello from the plugin",
   qos:0,
   retain:false,
   success:function(s){
 console.log(s);
   },
   error:function(e){
 console.log(s);
   }
})
//Declare this function in any scope to access the router function "on" to receive the payload for certain topic
*/
/*
 //Deprecated
 document.addEventListener(window.app.topic,function(e){
  console.log(e.payload)
 },false);

 //New way to listen to topics
 cordova.plugins.CordovaMqTTPlugin.listen("/topic/+singlewc/#multiwc",function(payload,params){
  //Callback:- (If the user has published to /topic/room/hall)
  //payload : contains payload data
  //params : {singlewc:room,multiwc:hall}
   console.log(payload);
  console.log(params);
})*/
///later, to stop
//bgLocationServices.stop();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
      /*  var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');*/

        //console.log('Received Event: ' + id);
    },
    detener:function() {
      window.app.animacion=undefined;
      window.app.animacionFinFLHEstado=5;
    },
    prueba(color){
      document.body.style.backgroundImage = "none"; 
      document.body.style.background = color;
      
    },
    tareaCOL: function(x) {
          console.log('acá va la tarea', new Date());
          var animacion=window.app.animacion;
          var i = window.app.animacionActual;
          if(window.app.animacion==undefined||window.app.animacion==''){
            return false;
          }
          if(i>=window.app.animacion.length){
            return false;
          }
          var local=window.app.gtm.replace(" GMT","");
          var today = new Date();
          var hora=today.getUTCHours();
          var horasumar=parseInt(s.substring(1,3));
          var signo=s.substring(0,1);
          if(signo=='+'){
            hora=hora+horasumar;
          }else{
            hora=hora-horasumar;
          }
          if(!window.app.animacionInicioVivo){
          //cargar fecha
            var fin=window.app.animacionFin.split(':');
            var inicio=window.app.animacionInicio.split(':');
            //validar tiempo
            if(hora>=parseInt(fin[0])&&today.getMinutes()>=parseInt(fin[1])&&today.getSeconds()>=parseInt(fin[0])){
              return false;
            }
            if(hora<parseInt(inicio[0])&&today.getMinutes()<parseInt(inicio[1])&&today.getSeconds()<parseInt(inicio[0])){
              return false;
            }
          }else{
            window.app.animacionInicioVivo=false;
          }  
            var efecto=animacion[i].split(".");
            console.log(efecto);
            
            document.body.style.backgroundColor = efecto[0];
            document.querySelector('.navbar-toggler-icon').style.color =  efecto[0];
            document.body.style.backgroundImage = "none";
            
            //cargar el ciclo
            if(i+1>=window.app.animacion.length){
              window.app.animacionActual=0;
              setTimeout(window.app.tareaCOL,efecto[1]*1000);
            }else{
              window.app.animacionActual=i+1;
              setTimeout(window.app.tareaCOL,efecto[1]*1000);
            }
    },
    tareaMUL: function(x) {
          console.log('acá va la tarea', new Date());
          var animacion=window.app.animacionMUL;
          var i = window.app.animacionActualMUL;
          if(window.app.animacionMUL==undefined||window.app.animacionMUL==''){
            return false;
          }
          if(i>=window.app.animacionMUL.length){
            return false;
          }
          var local=window.app.gtm.replace(" GMT","");
          var today = new Date();
          var hora=today.getUTCHours();
          var horasumar=parseInt(s.substring(1,3));
          var signo=s.substring(0,1);
          if(signo=='+'){
            hora=hora+horasumar;
          }else{
            hora=hora-horasumar;
          }
          if(!window.app.animacionInicioVivoMUL){
          //cargar fecha
            var fin=window.app.animacionFinMUL.split(':');
            var inicio=window.app.animacionInicioMUL.split(':');
            //validar tiempo
            if(hora>=parseInt(fin[0])&&today.getMinutes()>=parseInt(fin[1])&&today.getSeconds()>=parseInt(fin[0])){
              return false;
            }
            if(hora<parseInt(inicio[0])&&today.getMinutes()<parseInt(inicio[1])&&today.getSeconds()<parseInt(inicio[0])){
              return false;
            }
          }else{
            window.app.animacionInicioVivoMUL=false;
          }  
            var efecto=animacion[i].split("..");
            console.log(efecto);
            
          //  document.body.style.backgroundColor = efecto[0];
           // document.querySelector('.navbar-toggler-icon').style.color =  efecto[0];
           // document.body.style.backgroundImage = "none";
           //efecto[0]
           var existe=false;
           for (var i = window.app.imagenes.length - 1; i >= 0; i--) {
             if(window.app.imagenes[i]==efecto[0]){
              existe=true;
             }
           }
          if(!existe){
            window.app.LeerArchivo(efecto[0]);
            window.app.imagenes.push(efecto[0]);
            //cargar el ciclo
            if(i+1>=window.app.animacionMUL.length){
              window.app.animacionActualMUL=0;
              setTimeout(window.app.tareaMUL,efecto[1]*1000);
            }else{
              window.app.animacionActualMUL=i+1;
              setTimeout(window.app.tareaMUL,efecto[1]*1000);
            }

             }

    },
    tareaFLH: function() {
       console.log('acá va la tarea', new Date());
       if(window.app.animacionFinFLHEstado>2){
        return false;
       }
       var local=window.app.gtm.replace(" GMT","");
          var today = new Date();
          var hora=today.getUTCHours();
          var horasumar=parseInt(s.substring(1,3));
          var signo=s.substring(0,1);
          if(signo=='+'){
            hora=hora+horasumar;
          }else{
            hora=hora-horasumar;
          }
       if(!window.app.animacionInicioVivoFLH){
            //carga de tiempo
            var fin=window.app.animacionFinFLH.split(':');
            var inicio=window.app.animacionInicioFLH.split(':');
            //validacion de tiempo valido
            if(hora>=parseInt(inicio[0])&&hora<=parseInt(fin[0])){
              if(today.getMinutes()>=parseInt(inicio[1])){
                if(today.getSeconds()>=parseInt(inicio[2])){
                 // return true;//entra
                }else{
                  return false;
                }
              }else{
                return false;
              }
            }else{
              return false;
            }
            //validacion de tiempo valido
            if(hora<=parseInt(fin[0])){
              if(today.getMinutes()<=parseInt(fin[1])){
                if(today.getSeconds()<=parseInt(fin[2])){
                  //return true;
                }else{
                  return false;
                }
              }else{
                return false;
              }
            }else{
              return false;
            }

      }else{
            window.app.animacionInicioVivoFLH=false;
          } 
       if(window.app.animacionFLH==1){
        if(window.app.flash==undefined||window.app.flash==false){//flash encender
              window.plugins.flashlight.toggle(
                function() {window.app.flash=true;}, // optional success callback
                function() {}, // optional error callback
                {intensity: 1} // optional as well, used on iOS when switching on
              );
              window.app.animacionFLH=0;
            }
       }
        if(window.app.animacionFLH==0){
            if(window.app.flash==true){//flash apagar
              window.plugins.flashlight.toggle(
                function() {window.app.flash=false;}, // optional success callback
                function() {}, // optional error callback
                {intensity: 1} // optional as well, used on iOS when switching on
              );
              window.app.animacionFLH=1;
              window.app.intervaloFLH=undefined;
            }
        }

        if(window.app.animacionFLH==2){
            window.app.intervaloFLH=setInterval(window.app.flash,1*1000);
            window.app.animacionFLH=0;
        }
        today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; 
        var yyyy = today.getFullYear();
        window.app.animacionFinFLHEstado=window.app.animacionFinFLHEstado+1;
        window.app.lanzarElDia(new Date(yyyy+'-'+mm+'-'+dd+' '+window.app.animacionFinFLH+window.app.gtm), window.app.tareaFLH);


    },
    flashlight:function() {
      if(window.app.flash==undefined||window.app.flash==false){//flash apagar
              window.plugins.flashlight.toggle(
                function() {window.app.flash=true;}, // optional success callback
                function() {}, // optional error callback
                {intensity: 1} // optional as well, used on iOS when switching on
              );
            }else{
              window.plugins.flashlight.toggle(
                function() {window.app.flash=false;}, // optional success callback
                function() {}, // optional error callback
                {intensity: 1} // optional as well, used on iOS when switching on
              );
            }
    },
    lanzarElDia: function(momento, tarea){
          console.log('lanzado',new Date());
          console.log('para ser ejecutado en',momento);
          setTimeout(tarea, momento.getTime()-(new Date()).getTime());
      },
      sincronizadoListo:function (torrent) {
          window.axios.post(window.app.url+'/sincronizado', {torrent:torrent.name })
                    .then(res => {
                        let r = res.data;
                        console.log(r);
                        if(r.code === 200){
                           console.log("OK200");
                        }else{


                        }
                    })
                    .catch(function (error) {
                     //   console.log('erroresx: ', error.response.data);
                    });
      },
       torrent:function (uri){
          var WebTorrent = require('./web');
          //require('./bootstrap');
          var client = new WebTorrent();
          var magnetURI = uri;
          client.add(magnetURI, function (torrent) {
            // Got torrent metadata!
          console.log('Client is downloading:', torrent.infoHash)
          window.app.sincronizadoListo(torrent);
          torrent.on('done', function(){
          console.log('torrent finished downloading')
            //
            torrent.files.forEach(function(file){
                        function writeFile(fileEntry, dataObj) {
                          console.log("writeFile");
                            console.log(fileEntry);
                            // Create a FileWriter object for our FileEntry (log.txt).
                            fileEntry.createWriter(function (fileWriter) {

                                fileWriter.onwriteend = function() {
                                    console.log("Successful file write...");
                                   // window.app.readFile(fileEntry);
                                };

                                fileWriter.onerror = function (e) {
                                    console.log("Failed file write: " + e.toString());
                                };

                                // If data object is not passed in,
                                // create a new Blob instead.
                                if (!dataObj) {
                                    dataObj = new Blob(["Content if there's nothing!"], { type: 'text/plain' });
                                }

                                fileWriter.write(dataObj);
                            });
                        }
                        var fileName=file.name;
                file.getBlob(function (err, blob) {
                  if (err) throw err
                  var fileDir="/"+window.Laravel.empresa+"/"+window.Laravel.evento+"/";var file=blob;
                  window.resolveLocalFileSystemURL(cordova.file.dataDirectory,function(rootDirEntry){
                  console.log(rootDirEntry);
                  rootDirEntry.getDirectory("/"+window.Laravel.empresa, { create: true }, function (dirEntry) {
                                  console.log(dirEntry);
                                  dirEntry.getFile(fileName, { create: true }, function (fileEntry) { 
                                    // Success
                                    console.log("directorio creado si no exite");
                                  });
                                });
                  rootDirEntry.getDirectory(fileDir, { create: true }, function (dirEntry) {
                              var isAppend = true;
                              console.log(dirEntry);
                              dirEntry.getFile(fileName, { create: true }, function (fileEntry) {
                                  writeFile(fileEntry, blob, isAppend);
                                  // Success
                                  console.log("escrito");
                              });
                          });
                  });
                });
  });
});



  torrent.files.forEach(function (file) {
    // Display the file by appending it to the DOM. Supports video, audio, images, and
    // more. Specify a container element (CSS selector or reference to DOM node).
    //file.appendTo('body');
    console.log(file);
    //var absPath = "file:///storage/emulated/0/";

/*
window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (rootDirEntry) {
        rootDirEntry.getDirectory(fileDir, { create: true }, function (dirEntry) {
            var isAppend = true;
            dirEntry.getFile(fileName, { create: true }, function (fileEntry) {
                writeFile(fileEntry, file, isAppend);
                // Success
            });
        });
    });
*/


    console.log(file);
      client.seed(file, function (torrent) {
        console.log('Client is seeding:', torrent.infoHash)
      });
  });
});
    },
    sendTorrent:function (argument) {
      var WebTorrent = require('./web');
      //require('./bootstrap');
      var client = new WebTorrent();
      var fileDir="/"+window.Laravel.empresa+"/"+window.Laravel.evento+"/";
      var files=[];
      function listDir(path){
        window.resolveLocalFileSystemURL(path,
          function (fileSystem) {
            var reader = fileSystem.createReader();
            reader.readEntries(
              function (entries) {
                console.log(entries);
                for (var i = entries.length - 1; i >= 0; i--) {
        entries[i].file(function (file) {
                                var reader = new FileReader();

                                reader.onloadend = function() {
                                 //   console.log("Successful file read: " + this.result);
                                  //  console.log(fileEntry.fullPath + ": " + this.result);
                                // file has a trailing newline
                                //var data=this.result;
                                //var encoded = data.replace('\n', '');
                              //  var encoded = btoa(data);
                                // set mime type
                            //    var videoURL = "data:"+file.type+";base64,"+encoded;
                              console.log(file);
                              files.push(file);
                            // var video = '<video poster="/path/to/poster.jpg" id="player" playsinline controls><source src="/path/to/video.mp4" type="video/mp4" /><source src="/path/to/video.webm" type="video/webm" /></video>';
                            
                             var blob = new Blob([new Uint8Array(this.result)], { type: file.type });

                            console.log(files);
client.seed(this.result, function (torrent) {
          console.log('Client is seeding:', torrent.infoHash)
        })
                            
                              };

                                reader.readAsArrayBuffer(file);

                            }, function(error){
                            console.log(error);
                        });
}
        },
        function (err) {
          console.log(err);
        }
      ).then(function () {
       console.log(files);
      });
    }, function (err) {
      console.log(err);
    }
  );
}
      var fileDir="/"+window.Laravel.empresa+"/"+window.Laravel.evento+"/";
      listDir(cordova.file.dataDirectory + fileDir);
        client.seed(files, function (torrent) {
          console.log('Client is seeding:', torrent.infoHash)
        })
      
    },
    convertBase64ToBlob: function(any) {
    // DECODE BASE64 STRING
    const decodedData = window.atob(any);
    // CREATE UNIT8ARRAY OF SIZE SAME AS ROW DATA LENGTH
    const uInt8Array = new Uint8Array(decodedData.length);
    // INSERT ALL CHARACTER CODE INTO UINT8ARRAY
    for (let i = 0; i < decodedData.length; ++i) {
        uInt8Array[i] = decodedData.charCodeAt(i);
    }
    // RETURN BLOB IMAGE AFTER CONVERSION
    return new Blob([uInt8Array]);
},
    sincronizarArchivos:function () {
      console.log('window.Laravel', window.Laravel);
      var sync=false;
      if(window.Laravel.sincronizado!=null){
      for (var i2 = 0; i2 < window.Laravel.sincronizado.length; i2++) {
          if(window.Laravel.sincronizado[i2]==window.Laravel.evento){
            sync=true;
          }
        }
      }
      if(window.Laravel.empresa!=null&&sync==false){
        for (var i = 0; i < window.Laravel.archivos.length; i++) {
          var data="";
          if(window.Laravel.archivos[i].$binary==undefined){
            if(window.Laravel.archivos[i]!=undefined){
              data=window.Laravel.archivos[i];
            }
          }else{
            data=window.Laravel.archivos[i].$binary;
          }
          var torrent=window.app.convertBase64ToBlob(data);
          window.app.torrent(torrent);
        }
        
      }
      if(window.Laravel.empresa!=null&&sync==true){
        window.app.sendTorrent();
      }
    },
    imagenes:[],
    readFile:function (fileEntry) {

                            fileEntry.file(function (file) {
                                var reader = new FileReader();

                                reader.onloadend = function() {
                                 //   console.log("Successful file read: " + this.result);
                                  //  console.log(fileEntry.fullPath + ": " + this.result);
                                // file has a trailing newline
                                //var data=this.result;
                                //var encoded = data.replace('\n', '');
                              //  var encoded = btoa(data);
                                // set mime type
                            //    var videoURL = "data:"+file.type+";base64,"+encoded;
                              console.log(file);
                            // var video = '<video poster="/path/to/poster.jpg" id="player" playsinline controls><source src="/path/to/video.mp4" type="video/mp4" /><source src="/path/to/video.webm" type="video/webm" /></video>';
                            
                             var blob = new Blob([new Uint8Array(this.result)], { type: file.type });

                             if(file.type.split("/")[0]=="image"){
                              var div = document.createElement("div");
                              var x = document.createElement("img");
                              /*var url =window.URL.createObjectURL(blob);
                              x.setAttribute("src",url );
                              x.setAttribute("class","completo" );
                              div.setAttribute("class","caja" );
                              div.appendChild(x);*/
                              x=div;
                              document.body.style.backgroundImage = "url('"+url+"')";
                              document.body.style.backgroundPosition = "center";
                              document.body.style.backgroundRepeat="no-repeat";
                             }else if(file.type.split("/")[0]=="video"){
                              var x = document.createElement("video");
                              var x2 =document.createElement("source");
                               x2.setAttribute("type",file.type);
                               x2.setAttribute("src",window.URL.createObjectURL(blob));
                              x.setAttribute("controls", "controls");
                              x.setAttribute("autobuffer", "autobuffer");
                              x.setAttribute("autoplay", "autoplay");
                              x.appendChild(x2);
                             }
                             


                              document.body.appendChild(x);
                              };

                                reader.readAsArrayBuffer(file);

                            }, function(error){
                            console.log(error);
                        });
                        },
                        LeerArchivo:function (path) {

                           var datos=path.split("/");
                           var fileDir = "/" + window.Laravel.empresa + "/" + window.Laravel.evento + "/";
                           window.resolveLocalFileSystemURL(cordova.file.dataDirectory+datos[0]+"/"+datos[1],function(rootDirEntry){
                                      console.log(rootDirEntry);
                                      rootDirEntry.getDirectory(fileDir, { create: false }, function (dirEntry) {
                                                  var isAppend = true;
                                                  console.log(dirEntry);
                                                  dirEntry.getFile(datos[2], { create: true }, function (fileEntry) {
                                                      window.app.readFile(fileEntry);
                                                      // Success
                                                      console.log("leido");
                                                  });
                                              });

                                
                            




                                      });
                        }
    

};
//window.app.sendTorrent();
//window.app.torrent('magnet:?xt=urn:btih:0c5207462d0d2ba839b4d8d4bfa3686689738d63&dn=240192_splash.png&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com');
       

if(localStorage&&localStorage.getItem('cache')){
  window.app.cache=localStorage.getItem('cache') == 'false' ? false : true;
}else{
  window.app.cache=localStorage.setItem('cache','false');
}
app.initialize({});
