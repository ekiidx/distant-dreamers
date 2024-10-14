
window.sfx = {
    title: new Howl({
        src: [
          'assets/music/the-synths-loop.wav',
          'assets/music/the-synths-loop.ogg'
        ],
        loop: true,
      }),

      whoosh: new Howl({
        src: [ 
          'assets/music/whoosh-crystal.mp3'
        ],
        volume: 0.4
      }),

      bells: new Howl({
        src: [
          'assets/music/bells.mp3'
        ],
        volume: 0.5
      }),

      testRoom: new Howl({
        src: [
            'assets/music/testroom.wav',
            'assets/music/testroom.ogg'
        ],
        loop: true
      }),

      battle: new Howl({
        src: [
            'assets/music/battle.wav',
            'assets/music/battle.ogg'
        ],
        loop: true
      }),

    winner: new Howl({
        src: [
            'assets/music/winner.mp3'
        ],
        volume: 0.5
    })
}