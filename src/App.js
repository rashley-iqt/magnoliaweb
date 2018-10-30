import React, { Component } from 'react';
import classNames from 'classnames';
import axios from 'axios';
import Waveform from 'waveform-react';

import { FontAwesomeIcon }from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";

import FileUpload from "./components/FileUpload";
import FileDownload from "./components/FileDownload";
import { getAudioBuffer, getAudioContext } from './utils/audioBufferUtils';

import style from './App.module.css';

class App extends Component {
  

  state = {
    selectedFile: null,
    working: false,
    downloadUrl: null,
    downloadName: '',
    sourceBuffer: null,
    resultBuffer: null
  };

  onUpload = (file) => {
    const fr = new FileReader();

    fr.onload = () => {
      const arrBuff = fr.result;
      getAudioBuffer(arrBuff, getAudioContext()).then((sourceBuff) => {
        this.setState({
          working:true,
          selectedFile: file.name,
          sourceBuffer: sourceBuff
        });
      });
    };
    fr.readAsArrayBuffer(file);

    const fd = new FormData();
    fd.append('file', file);
    fd.append('filename', file.name)

    const dlName = file.name + '-denoised';
    axios.post('http://localhost:5001/api/v1/convert', fd)
      .then(async (response) => {
        const url = 'http://localhost:5001' + response.data;
        const result = await fetch(url, { 'crossDomain': true });
          const buff = await result.arrayBuffer();
          const urlObject = window.URL || window.webkitURL || window;
          const aBlob = new Blob([buff]);
          const dlUrl = urlObject.createObjectURL(aBlob);
          getAudioBuffer(buff, getAudioContext()).then((resultBuff) => {
            this.setState({
              working:false,
              selectedFile: file.name,
              resultBuffer: resultBuff
            });
          });

        this.setState({
          working:false,
          downloadName: dlName,
          downloadUrl: dlUrl,
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
            working:false,
            downloadUrl: null,
          });
      })
  }

  render() {
    const sourceStyle = {
      animate: true,
      color: '#000066',
      plot: 'bar',
      pointWidth: 1
    };
    const resultStyle = {
      animate: true,
      color: '#cc0000',
      plot: 'bar',
      pointWidth: 1
    };
    const width = 900;
    const height = 300;
    return (
      <div className="App">
        <div className={style.appContainer}>
          <div className={style.controls}>
            <span className={style.label}>Upload</span>
            <FileUpload
                className={style.fileUpload}
                selected={this.state.selectedFile}
                onChange={this.onUpload}
              />
              {this.state.downloadUrl &&
                <div>
                  <span className={style.label}>Download Result</span>
                  <FileDownload
                    className={style.fileDownload}
                    selected={this.state.downloadName}
                    url={this.state.downloadUrl}
                    disabled={!this.state.downloadUrl}
                  />
                </div>
              }
          </div>
          <div className={ style.columnDiv } >
              <div className={classNames({[style.hidden]: !this.state.sourceBuffer}) } >
                <span className={style.label}>Source Graph:</span>
                <Waveform
                  buffer={this.state.sourceBuffer}
                  height={height}
                  waveStyle={sourceStyle}
                  width={width}
                />
              </div>
              <span className={classNames({[style.justifySpan]: true, [style.hidden]: !this.state.working}) }>
               <div className={ style.icon }>
                    <FontAwesomeIcon icon={faSync} className="fa-spin" size="7x" color="#000066"/>
                </div>
                <div className={style.bigText}>
                  Processing File...
                </div>
              </span>
              <div className={classNames({[style.hidden]: !this.state.resultBuffer}) } >
                <span className={style.label}>Result Graph:</span>
                <Waveform
                  buffer={this.state.resultBuffer}
                  height={height}
                  waveStyle={resultStyle}
                  width={width}
                />
              </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
