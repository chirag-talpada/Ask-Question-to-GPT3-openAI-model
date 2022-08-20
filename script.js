const micBtn=document.getElementById('enableVoice');
const voiceList=document.getElementById('voicelist');
const answerBtn=document.getElementById('getAnswer');

const question=document.getElementById('inputText');

let getPermission=false;
const clickEffect=new Audio('./sound/click.wav')
const unClickEffect=new Audio('./sound/unclick.wav')
const tts =window.speechSynthesis;
let voices=[];


window.SpeechRecognition = window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();


function speakAnswer(txt){

    if(tts.speaking){
        return
    }

    const tospeak = new SpeechSynthesisUtterance(txt);
    let selectedVoice = voiceList.selectedOptions[0].getAttribute('data-name');

    voices.forEach((voice)=>{
        if(voice.name === selectedVoice){
            tospeak.voice = voice;
        }
    });

    tospeak.pitch=1;
    tospeak.rate=1;
    tospeak.volume=1;
    tts.speak(tospeak);
    console.log(tospeak);

}


function getVoicesList(){
    voices=tts.getVoices();
    voiceList.innerHTML='';

    voices.forEach((voice)=>{
        let listitem=document.createElement('option');
        listitem.textContent=voice.name;
        listitem.setAttribute('data-lang',voice.lang);
        listitem.setAttribute('data-name',voice.name);
        voiceList.appendChild(listitem);
    });

    voiceList.selectedIndex=0;

}



micBtn.addEventListener('click',()=>{

    if(getPermission){
        unClickEffect.play();
        micBtn.classList.remove("active");
        micBtn.innerText="mic";
        recognition.stop();
        getPermission=false;
        return
    }

    recognition.interimResults = true;
    recognition.continuous=true;

    recognition.addEventListener('result',e=>{
        const transcript=Array.from(e.results).map(result=>result[0]).map(result=>result.transcript);

        document.getElementById('inputText').innerText=transcript;
    });

    if(!getPermission){
        clickEffect.play();
        micBtn.classList.add("active");
        micBtn.innerText="mic_off";
        recognition.start();
        getPermission=true;
    }
    
});

getVoicesList();

if(speechSynthesis!==undefined){
    speechSynthesis.onvoiceschanged=getVoicesList;
}


function openai_test() {
  
    var url = "https://api.openai.com/v1/completions";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer [API-KEY]");

    xhr.addEventListener('error',()=>{
        alert("something is wrong!")
    });

    xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        document.getElementById('getAnswer').classList.remove("load");
        const obj=JSON.parse(xhr.responseText);

        if(obj.hasOwnProperty('error')){
            alert("Invalid input!!!");
            document.getElementById('answertext').innerText="";
            question.value="";
            return
        }
        const answer=obj.choices[0].text.replace(/\n/g, '');
        document.getElementById('answertext').innerText=answer;
        speakAnswer(answer);
    }};

    var data = `{
    "model": "text-davinci-002",
    "prompt": "${question.value}",
    "temperature": 0.7,
    "max_tokens": 256,
    "top_p": 1,
    "frequency_penalty": 0,
    "presence_penalty": 0
    }`;

    xhr.send(data);



}


answerBtn.addEventListener('click',()=>{
    
    const q1=question.value;

    if(q1===null || q1==="" ||q1.replace(/ /g,"")===""){
        alert("Question can not be empty")
    }else{
        openai_test();
        document.getElementById('getAnswer').classList.add("load");
    }
    
});





