let studname;
const video=document.getElementById('video');
const sname=document.getElementById('studentname');
const simg=document.getElementById('studentimg');

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),

]).then(start)

function start(){
    navigator.getUserMedia(
        {
            video:{}
        },
        stream =>video.srcObject= stream,
        err=>console.error(err)
    )
    recognizeFaces();
}

async function recognizeFaces() {

    const labeledDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.9)
    video.addEventListener('play',()=>{

    const canvas=faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize={width:video.width,height:video.height}
    faceapi.matchDimensions(canvas,displaySize)

    setInterval(async ()=>{
        const detections=await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections=faceapi.resizeResults(detections,displaySize)
        canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height)


        const results = resizedDetections.map((d) => {
            return faceMatcher.findBestMatch(d.descriptor)
        })
        studname=results[0]._label;
        
        sname.innerText=`Detected Student: ${results[0]._label}`;
        simg.src=`/labeled_images/${results[0]._label}/1.jpg`;
        results.forEach( (result, i) => {
            const box = resizedDetections[i].detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
            faceapi.draw.drawDetections(canvas,resizedDetections)
            faceapi.draw.drawFaceLandmarks(canvas,resizedDetections)
            drawBox.draw(canvas)
        })

    },100)
})
}

function loadLabeledImages() {
    const labels = ['Debdeep Ghosal','Soham Goswami',]
    return Promise.all(
      labels.map(async label => {
        const descriptions = []
        for (let i = 1; i <= 2; i++) {
          const img = await faceapi.fetchImage(`./labeled_images//${label}/${i}.jpg`)
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
  }

setInterval(async() => {
    if (studname!=null) {
            
        const json=JSON.stringify({"name":`${studname} ,`});
        axios
              .post('/attendance', json,{
                  headers: {
                    'Content-Type': 'application/json'
                  }
                })
    }
    clearTimeout(this);
  }, 5000); 
