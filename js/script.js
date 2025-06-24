let songs;
let songsname = [];
let songsurl = [];
let currfolder;
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
let currentAudio = new Audio()
const playMusic = (track, pause = false,folder) => {
    currentAudio.src = currfolder + track + ".mp3";
    if (!pause) {
        currentAudio.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = `<span>${track}</span>`
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
};

async function getSongs(folder) {
    currfolder=folder
    let res = await fetch(`http://127.0.0.1:5500/${currfolder}/`);
    let html = await res.text();

    // Create a DOM parser
    let parser = new DOMParser();
    let doc = parser.parseFromString(html, "text/html");

    // Get all <a> tags that link to .mp3 files
    songs = Array.from(doc.querySelectorAll("a"))
        .filter(a => a.href.endsWith(".mp3"))
        .map(a => ({
            name: a.textContent.trim().split(".mp3")[0],
            url: a.href
        }));

    // let Songs = []
    // for (let index = 0; index < links.length; index++) {
    //     const element = links[index].url;
    //     Songs.push(element);
    // }

    //making songs name and signs url stred in diffrent array
    for (const song of songs) {
        songsname.push(song.name);
        songsurl.push(song.url)
    }

    // // Example: Add to a list
    // links.forEach(song => {
    //     const li = document.createElement("li");
    //     li.innerText = song.name;
    //     document.body.appendChild(li);
    // });

    playMusic(songs[0].name, true)
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML=""
    for (const song of songs) {
        songUL.innerHTML += `<li><img src="img/music.svg" class="invert" alt="">
                            <div class="info">
                                <div>${song.name}</div>
                                <div>harry</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert"  src="img/play.svg" alt="">
                            </div> </li>`

    }


    //attach an event listener to an each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    })



}

async function displayAlbum(){
    let res = await fetch(`http://127.0.0.1:5500/album/`);
    let html = await res.text();
    let div=document.createElement("div")
    div.innerHTML=html
    let anchors=div.getElementsByTagName("a")
    let array=Array.from(anchors)
    for(let index=0;index<anchors.length;index++){
        const e=array[index]
        if(e.href.includes("/album/")){
            let folder=(e.href.split("/").slice(-1)[0])
            //get the metadata of folder
            let res = await fetch(`http://127.0.0.1:5500/album/${folder}/info.json`);
            let response = await res.json();
            document.querySelector(".cardContainer").innerHTML+=`<div data-folder="${folder}" class="card">
                        <div class="play">
                            <div style="background-color: #1DB954; border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
                                <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"
                                    viewBox="0 0 24 24" width="24" height="24" fill="black">
                                    <path
                                        d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606" />
                                </svg>
                            </div>
                        </div>
                        <img src="/album/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`

        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
           songsname.length=0
           await getSongs(`/album/${item.currentTarget.dataset.folder}/`)
           play.src = "img/play.svg" 
           console.log(songsname)
           playMusic(songsname[0])
        })
    })


}

async function main() {
    //display all the albums

    displayAlbum()
    

    //attach event listener to play,prev,and next
    play.addEventListener('click', () => {
        if (currentAudio.paused) {
            currentAudio.play()
            play.src = "img/pause.svg"
        }
        else {
            currentAudio.pause()
            play.src = "img/play.svg"
        }
    })

    //listen for time update function
    currentAudio.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentAudio.currentTime)}/${formatTime(currentAudio.duration)}`
        document.querySelector(".circle").style.left = (currentAudio.currentTime / currentAudio.duration) * 100 + "%";
    })

    // add an event listener to seekbar

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentAudio.currentTime = ((currentAudio.duration) * percent) / 100

    })
    //add an eventlistener for hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
        document.querySelector(".left").style.width = "395px"
    })

    //adding an event listener to close the hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
        document.querySelector(".left").style.width = "25vw"
    })

    //add an event listener to previous and next
    prev.addEventListener("click", () => {
       
        let rawFileName = currentAudio.src.split("/").slice(-1)[0];
        let decodedName = decodeURIComponent(rawFileName).replace(".mp3", "").trim();

        

        // Try fuzzy matching — not strict ===
        let index = songsname.findIndex(name => decodedName.includes(name) || name.includes(decodedName));

        
        if(index==0){
            index=songsname.length;
        }
        playMusic(songsname[index-1])

    })
    next.addEventListener("click", () => {

        // Get filename from src and decode URL-encoded parts
        let rawFileName = currentAudio.src.split("/").slice(-1)[0];
        let decodedName = decodeURIComponent(rawFileName).replace(".mp3", "").trim();


        // Try fuzzy matching — not strict ===
        let index = songsname.findIndex(name => decodedName.includes(name) || name.includes(decodedName));

        
        if(index==((songsname.length)-1)){
            index=-1;
        }
        playMusic(songsname[index+1])
    })


    // adding volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        
        currentAudio.volume=parseInt(e.target.value)/100
        if(e.target.value>0){
            document.querySelector(".volume").getElementsByTagName("img")[0].src=document.querySelector(".volume").getElementsByTagName("img")[0].src.replace("img/mute.svg","img/volume.svg")
        }
        else if(e.target.value==0){
            document.querySelector(".volume").getElementsByTagName("img")[0].src=document.querySelector(".volume").getElementsByTagName("img")[0].src.replace("img/volume.svg","img/mute.svg")
        }
        
    })

    //add event listener to mute
    document.querySelector(".volume").getElementsByTagName("img")[0].addEventListener("click",(e)=>{
        if(e.target.src.includes("img/volume.svg")){
           e.target.src= e.target.src.replace("img/volume.svg","img/mute.svg")
            currentAudio.volume=0
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else{
            e.target.src=e.target.src.replace("img/mute.svg","img/volume.svg")
            currentAudio.volume=0.10
            document.querySelector(".range").getElementsByTagName("input")[0].value=10
        }

    })

}
main();

