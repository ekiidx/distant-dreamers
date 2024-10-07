class TitleScreen {
    constructor({ save }) {
      this.save = save;
    }
  
    getOptions(resolve) {
      const saveFile = this.save.getSaveFile();
      return [
        { 
          label: "New Game",
          description: "",
          handler: () => {
            this.close();
            resolve();
          }
        },
        saveFile ? {
          label: "Continue Game",
          description: "",
          handler: () => {
            this.close();
            resolve(saveFile);
          }
        } : null
        // Filter out any value that isn't truthy
      ].filter(v => v);
    }
  
    createElement() {
      this.element = document.createElement("div");
      this.element.classList.add("title-screen");
      this.element.innerHTML = (`
        <img class="title-screen-logo" src="assets/images/distant-dreamers-logo.png" alt="Distant Dreamers" />
      `)
    }
  
    close() {
      this.keyboardMenu.end();
      this.element.remove();
    }
    
    init(container) {
      return new Promise(resolve => {

        // const playAudio = () => {
        //   const audio = new Audio('/assets/music/title.wav');
        //   audio.play();
        // }
       
        // playAudio();

        // function myFunction() {
        //   var x = document.getElementById("myAudio").autoplay;
        //   document.getElementById("demo").innerHTML = x;
        // }

        // myFunction();

        // let audio = new Audio('assets/music/title.wav');

        // audio.muted = true;
        // audio.addEventListener("canplaythrough", () => {
        //    audio.play()
        // });
        

      //   window.addEventListener('load', function() {
      //     const audio = document.getElementById('bg-music');
      //     audio.play();

      //     document.addEventListener('click', function() {
      //         // Unmute and play the audio
      //         audio.muted = false;
      //         audio.play().catch(function(error) {
      //             console.log('Playback prevented:', error);
      //         });

      //         // Remove the event listener after the first interaction
      //         // document.removeEventListener('click', arguments.callee);
      //     });
      // });

        this.createElement();
        container.appendChild(this.element);
        this.keyboardMenu = new KeyboardMenu();
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions(resolve));
      })
    }
  }