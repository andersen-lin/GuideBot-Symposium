(function (window) {
    //兼容
    window.URL = window.URL || window.webkitURL;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    var HZRecorder = function (stream, config) {
        config = config || {};
        config.sampleBits = config.sampleBits || 16;
        config.sampleRate = config.sampleRate || (16000);

        var context = new (window.webkitAudioContext || window.AudioContext)();
        var audioInput = context.createMediaStreamSource(stream);
        var createScript = context.createScriptProcessor || context.createJavaScriptNode;
        var recorder = createScript.apply(context, [4096, 1, 1]);

        var audioData = {
            size: 0
            , buffer: []
            , inputSampleRate: context.sampleRate
            , inputSampleBits: 16
            , outputSampleRate: config.sampleRate
            , oututSampleBits: config.sampleBits
            , input: function (data) {
                this.buffer.push(new Float32Array(data));
                this.size += data.length;
            }
            , compress: function () {
                var data = new Float32Array(this.size);
                var offset = 0;
                for (var i = 0; i < this.buffer.length; i++) {
                    data.set(this.buffer[i], offset);
                    offset += this.buffer[i].length;
                }
                var compression = parseInt(this.inputSampleRate / this.outputSampleRate);
                var length = data.length / compression;
                var result = new Float32Array(length);
                var index = 0, j = 0;
                while (index < length) {
                    result[index] = data[j];
                    j += compression;
                    index++;
                }
                return result;
            }
            , encodeWAV: function () {
                var sampleRate = Math.min(this.inputSampleRate, this.outputSampleRate);
                var sampleBits = Math.min(this.inputSampleBits, this.oututSampleBits);
                var bytes = this.compress();
                var dataLength = bytes.length * (sampleBits / 8);
                var buffer = new ArrayBuffer(44 + dataLength);
                var data = new DataView(buffer);

                var channelCount = 1;
                var offset = 0;

                var writeString = function (str) {
                    for (var i = 0; i < str.length; i++) {
                        data.setUint8(offset + i, str.charCodeAt(i));
                    }
                }

                writeString('RIFF'); offset += 4;
                data.setUint32(offset, 36 + dataLength, true); offset += 4;
                writeString('WAVE'); offset += 4;
                writeString('fmt '); offset += 4;
                data.setUint32(offset, 16, true); offset += 4;
                data.setUint16(offset, 1, true); offset += 2;
                data.setUint16(offset, channelCount, true); offset += 2;
                data.setUint32(offset, sampleRate, true); offset += 4; 
                data.setUint32(offset, channelCount * sampleRate * (sampleBits / 8), true); offset += 4; 
                data.setUint16(offset, channelCount * (sampleBits / 8), true); offset += 2;
                data.setUint16(offset, sampleBits, true); offset += 2;
                writeString('data'); offset += 4; 
                data.setUint32(offset, dataLength, true); offset += 4;
                if (sampleBits === 8) {
                    for (var i = 0; i < bytes.length; i++, offset++) {
                        var s = Math.max(-1, Math.min(1, bytes[i]));
                        var val = s < 0 ? s * 0x8000 : s * 0x7FFF;
                        val = parseInt(255 / (65535 / (val + 32768)));
                        data.setInt8(offset, val, true);
                    }
                } else {
                    for (var i = 0; i < bytes.length; i++, offset += 2) {
                        var s = Math.max(-1, Math.min(1, bytes[i]));
                        data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                    }
                }

                return new Blob([data], { type: 'audio/wav' });
            }
        };

        this.start = function () {
            audioInput.connect(recorder);
            recorder.connect(context.destination);
        }

        this.stop = function () {
            recorder.disconnect();
        }

        this.getBlob = function () {
            this.stop();
            return audioData.encodeWAV();
        }

        this.play = function (audio) {
            audio.src = window.URL.createObjectURL(this.getBlob());
        }

        this.upload = function () {
                var blob = this.getBlob();
		var reader = new FileReader();
    		reader.onload = function(event){
    		var fd = {};
   		fd["fname"] = "test.wav";
    		fd["data"] = event.target.result;
 		$.ajax({
       		 type: 'POST',
		 url:'js/uploadWav.php', 
       		 data: fd,
        	// processData: false,
        	// contentType: false,
       		 }).done(function(data) {
         	   console.log(data);
	var HttpClient = function() {
    		this.get = function(aUrl, aCallback) {
       		 var anHttpRequest = new XMLHttpRequest();
        		anHttpRequest.onreadystatechange = function() { 
            		if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
              		  aCallback(anHttpRequest.responseText);
       			 						}

       		 anHttpRequest.open( "GET", aUrl, true );            
        	 anHttpRequest.send( null );
   						     }
					    }
	var client = new HttpClient();
	client.get('js/google_speech.php', function(response) {
		var keyword_1 = "VC";
                var keyword_2 = "ngineering";
                var keyword_3 = "ervice";
                var keyword_4 = "ssessment";
                var keyword_5 = "ransport";
                if(response.includes(keyword_1))
                        {
                        destination="vcipl";
                        alert(destination);
                        }
                else
                        if (response.includes(keyword_2))
                        {
                        destination="Bioengineering lab";
                        alert(destination);
                        }
                else
                        if (response.includes(keyword_3))
                        {
                        destination="CEAT Facilities Service office";
			 alert(destination);
                        }
                else
                        if (response.includes(keyword_4))
                        {
                        destination="Industrial assessment center";
                        alert(destination);
                        }
                else
                        if (response.includes(keyword_5))
                        {
                        destination="Building Airflow & contaminant Transport lab";
                        alert(destination);
                        }
                else
			{
			destination="empty";
                        alert("no match");
			}

		});


        	});
   	};
          reader.readAsDataURL(blob);
        }

        recorder.onaudioprocess = function (e) {
            audioData.input(e.inputBuffer.getChannelData(0));
        }

    };
    HZRecorder.throwError = function (message) {
        alert(message);
        throw new function () { this.toString = function () { return message; } }
    }
    HZRecorder.canRecording = (navigator.getUserMedia != null);
    HZRecorder.get = function (callback, config) {
        if (callback) {
            if (navigator.getUserMedia) {
                navigator.getUserMedia(
                    { audio: true }
                    , function (stream) {
                        var rec = new HZRecorder(stream, config);
                        callback(rec);
                    }
                    , function (error) {
                        switch (error.code || error.name) {
                            case 'PERMISSION_DENIED':
                            case 'PermissionDeniedError':
                                HZRecorder.throwError('The user declined to provide information.');
                                break;
                            case 'NOT_SUPPORTED_ERROR':
                            case 'NotSupportedError':
                                HZRecorder.throwError('The browser does not support hardware device.');
                                break;
                            case 'MANDATORY_UNSATISFIED_ERROR':
                            case 'MandatoryUnsatisfiedError':
                                HZRecorder.throwError('Cannot find the specified hardware device.');
                                break;
                            default:
                                HZRecorder.throwError('Unable to open the microphone. Abnormal information: ' + (error.code || error.name));
                                break;
                        }
                    });
            } else {
                HZRecorder.throwErr('The current browser does not support recording.'); return;
            }
        }
    }

    window.HZRecorder = HZRecorder;

})(window);