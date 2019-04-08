import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import swal from "sweetalert2";
import logoOne from '../../../public/images/logo-one.png';
//import logoFacebook from '../../../../public/images/social/facebook-icon.svg';
//import logoGoogle from '../../../../public/images/social/google-icon.svg';
//import logoGooglePlay from '../../../../public/images/others/download-google-play.png';
//import logoAppleStore from '../../../../public/images/others/download-app-store.png';
//import {isMobile,isMobileOnly,isAndroid,isIOS,isChrome,isFirefox,isSafari,isMobileSafari,osVersion,osName,browserName, } from 'react-device-detect';

library.add( faSync);

export default class Index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            url: props.url,
            urlGooglePlay: props.googleplay,
            urlAppleStore: props.applestore
        };

    }
    isCordova() {
            return navigator.userAgent.match(/(Cordova)/);
        }
    getOS() {

        let userAgent = window.navigator.userAgent,
            platform = window.navigator.platform,
            macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
            windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
            iosPlatforms = ['iPhone', 'iPad', 'iPod'],
            os = null;

        if (macosPlatforms.indexOf(platform) !== -1) {
            os = 'Mac OS';
        } else if (iosPlatforms.indexOf(platform) !== -1) {
            os = 'iOS';
        } else if (windowsPlatforms.indexOf(platform) !== -1) {
            os = 'Windows';
        } else if (/Android/.test(userAgent)) {
            os = 'Android';
        } else if (!os && /Linux/.test(platform)) {
            os = 'Linux';
        }

        return os;
    }

    render() {

        let url = this.state.url;

        let urlIngresar    = url + '/login';
        let urlRegistrar   = url + '/registro';
        let urlVisitante   = url + '/visitante';
        let urlFacebook    = url + '/auth/facebook';
        let urlGoogle      = url + '/auth/google';
        let urlGooglePlay  = this.state.urlGooglePlay;
        let urlAppleStore  = this.state.urlAppleStore;

        //console.log(osName,osVersion,browserName, this.getOS());

        return (

            <div className="abs-center roboto-condensed">


                <div className="box">

                    <div className="">
                        <img src={'../public'+logoOne} className="img-fluid logo-box-index" />
                    </div>

                    <div className="text-center">
                        <a href={urlIngresar}>
                            <div className="btn btn-negro btn-box-index">Ingresar</div>
                        </a>
                    </div>

                    <div className="text-center">
                        <a href={urlRegistrar}>
                            <div className="btn btn-rojo btn-box-index">Registrar</div>
                        </a>
                    </div>

                  


                    





                </div>


            </div>
        );
    }
}

if (document.getElementById('index')) {

    const element = document.getElementById('index');

    const props = Object.assign({}, element.dataset);

    ReactDOM.render(<Index {...props} />, element);
}