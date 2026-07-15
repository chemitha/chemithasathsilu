          const audio = new Audio("./assets/audio/Chay-mi-thuh-Sat-si-lu.mp3");
          const button = document.querySelector(".IPA-trans");

          button.onclick = () => {
            if (!audio.paused) return;

            audio.currentTime = 0;
            audio.play();
          };