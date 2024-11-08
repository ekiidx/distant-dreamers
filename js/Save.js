class Save {
    constructor() {
      this.mapId = "Intro";
      this.startingHeroX = 6;
      this.startingHeroY = 10;
      this.startingHeroDirection = "up";
      this.saveFileKey = "Distant_Dreamers_SaveFile_1";
    }
  
    save() {
      window.localStorage.setItem(this.saveFileKey, JSON.stringify({
        mapId: this.mapId,
        startingHeroX: this.startingHeroX,
        startingHeroY: this.startingHeroY,
        startingHeroDirection: this.startingHeroDirection,
        playerState: {
          fighters: playerState.fighters,
          lineup: playerState.lineup,
          items: playerState.items,
          storyFlags: playerState.storyFlags
        }
      }))
    }
  
    getSaveFile() {
      if (!window.localStorage) {
        return null;
      }

      const file = window.localStorage.getItem(this.saveFileKey);
      return file ? JSON.parse(file) : null;
    }
    
    load() {
      const file = this.getSaveFile();
      if (file) {
        this.mapId = file.mapId;
        this.startingHeroX = file.startingHeroX;
        this.startingHeroY = file.startingHeroY;
        this.startingHeroDirection = file.startingHeroDirection;
        Object.keys(file.playerState).forEach(key => {
          playerState[key] = file.playerState[key];
        })
      }
    }
  }