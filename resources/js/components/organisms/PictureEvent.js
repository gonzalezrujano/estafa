import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import SweetAlert from 'sweetalert2-react';
import ImgsViewer from 'react-images-viewer';
import { 
  executeJob,
  turnShowOff,
  findFileInPhoneStorage
} from '../../redux/actions/show';

function PictureEvent (props) {
  const { imagen } = props;
  // const tracker = { timeout: null, interval: null };
  const [ source, setSource ] = useState({ src: '', show: false });
  const [sweetAlert, setSweetAlert] = useState({title: '', text: '', show: false});
  const [isBrightnessAtMax, setBrightness] = useState(false);

  /**
   * When a command is beign executed
   * put brightness at maximum level
   */
  useEffect(() => {
    if (imagen.current && !isBrightnessAtMax) {
      setBrightness(true);
      
      Cordova.exec(prevBright => {
        Cordova.exec(() => {
          console.log('Brightness change');
        }, e => console.log(e), 'Brightness', 'setBrightness', [1]);

      }, e => console.log(e), 'Brightness', 'getBrightness', []);
    } else if (imagen.current === null) {
      setBrightness(false);     
    }

    if (imagen.current && imagen.current.vibrate) {
      navigator.vibrate(250);
    }
  }, [imagen.current]);

  // /**
  //  * Time Tracker
  //  */
  // Previous console configuration
  // useEffect(() => {
  //   if (imagen.current) {
  //     clearInterval(tracker.interval);
  //     clearTimeout(tracker.timeout);

  //     let now = new Date();
  //     let delay = imagen.current.startTime - now.getTime();

  //     if (delay > 0) {
  //       tracker.timeout = setTimeout(props.executeJob, delay, imagen.current.type);
  //     } else {
  //       props.executeJob(imagen.current.type);
  //     }
      
  //     tracker.interval = setInterval(checkCurrentShow, 1000, imagen.current, 'imagen');
  //   } else {
  //     clearInterval(tracker.interval);
  //     clearTimeout(tracker.timeout);
  //   }

  //   return () => {
  //     clearInterval(tracker.interval);
  //     clearInterval(tracker.timeout);
  //   }
  // }, [imagen.current]);

  useEffect(() => {
    if (imagen.current) {
      props.findFileInPhoneStorage(imagen.current.payload).then(({internalURL}) => {
        setSource({ src: internalURL, show: true });
      })
      .catch(err => {
        console.log('err', err);
        switch (err.code) {
          case 1:
            if (process.env.NODE_ENV === 'development') {
              setSweetAlert({ 
                type: `info`, 
                title: ``, 
                text: '...', 
                show: true 
              });

              setTimeout(() => setSweetAlert({
                type: 'info',
                title: '',
                text: '...',
                show: false,
              }), 1000);
            }
          break;
        }
      });
    } else {
      setSource({ src: '', show: false });
    }
  }, [imagen.current])

  /**
   * Turning Event Off
   */
  // Previous console configuration
  // function checkCurrentShow (job) {
  //   let now = new Date();
    
  //   if (now.getTime() >= parseInt(job.endTime)) {
  //     console.log(`Stopping show ${job.type}`);
  //     props.turnShowOff(job);
  //     clearInterval(tracker.interval);
  //   } else {
  //     console.log(`Running show ${job.type}`);
  //   }
  // }
  
  return (
    <div>
      <ImgsViewer
        imgs={[{ src: source.src }]}
        isOpen={source.show}
        onClickPrev={() => null}
        onClickNext={() => null}
        showImgCount={false}
        onClose={() => setSource({ src: '', show: false })}
      />
      <SweetAlert
        type="error"
        show={sweetAlert.show}
        title={sweetAlert.title}
        text={sweetAlert.text}
        onConfirm={() => setSweetAlert({title: '', text: '', show: false})}
      />
    </div>
  );
}

const mapStateToProps = state => ({
  event: state.events.current,
  imagen: state.show.imagen
});

const mapDispatchToProps = dispatch => ({
  executeJob: (type) => dispatch(executeJob(type)),
  turnShowOff: (job) => dispatch(turnShowOff(job)),
  findFileInPhoneStorage: (fileName) => dispatch(findFileInPhoneStorage(fileName)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PictureEvent);