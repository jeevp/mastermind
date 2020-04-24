Vue.config.devtools = true

Vue.prototype.$numOfPegs = 4
Vue.prototype.$gameColors = ['green', 'blue', 'yellow', 'orange', 'red', 'purple']

Vue.component('guess-container', {
  template:`

  <div>

    <div id="timer" v-show="started">
      <span id="round_num" v-show="started">Guess {{ roundNum + 1 }}</span>
      <i class="fas fa-clock"></i>
      {{formattedElapsedTime}}
    </div>

    <transition name="slide-fade">
      <div class="congrats" v-show="gameWin"><h3>Congratulations, you won in {{ roundNum + 1 }} rounds!</h3></div>
    </transition>

    <div id="guess_container">
      <component
        v-show="!gameWin"
        v-for="(guess, index) in guessArr"
        :is="guess"
        :roundNum="index"
        :answerArray=answerArray
        :gameWin=false
        @correctGuess="winEvent"
        @wrongGuess="newGuess">
      </component>
    </div>

  </div>
  `,

  data() {
    return this.initialState();
  },

  computed: {
    formattedElapsedTime() {
      const date = new Date(null);
      date.setSeconds(this.elapsedTime / 1000);
      const utc = date.toUTCString();
      return utc.substr(utc.indexOf(":") - 2, 8);
    }
  },

  mounted() {
    this.startGame();
    this.startTime();
  },

  methods: {
    initialState() {
      return {
        init: true,
        started: false,
        gameWin: false,
        answerArray: [],
        guessArr: [],
        roundNum: 0,
        elapsedTime: 0,
        timer: undefined
      }
    },

    startGame() {
      this.started = true;
      this.init = false;
      var x;
      var colors = ['green', 'blue', 'yellow', 'orange', 'red', 'purple'];
      for (var i = 0; i < this.$numOfPegs; i++) {
        x = Math.floor(Math.random() * 5) + 0;
        this.answerArray.push(colors[x]);
      }
      this.guessArr.push('code-pegs-container');
      console.log('answerArray: ' + this.answerArray);
    },

    winEvent() {
      this.gameWin = true;
    },

    newGuess(pegColors) {
      this.guessArr.push('code-pegs-container');
      this.roundNum++;
    },

    startTime() {
      this.timer = setInterval(() => {
        this.elapsedTime += 1000;
      }, 1000);
    },

    resetTime() {
      clearInterval(this.timer);
      this.elapsedTime = 0;
    }
  },
  destroyed() {
    this.startGame();
  }

})

Vue.component('code-pegs-container', {
  template:`
  <div class="round_container">

    <component
      v-for="(item, index) in pegArray"
      :is="item"
      :pegIndex="index"
      :switchable="active"
      :class="{ disabled: !active }"
      >
    </component>

    <ul class="key_pegs" v-show="submitted">
      <li v-for="n in correctColors" class="key_peg white_peg"></li><li v-for="n in correctPegs" class="key_peg red_peg"></li><li v-for="n in (this.$numOfPegs - (correctPegs + correctColors))" class="key_peg empty_peg"></li>
    </ul>

    <button
      class="btn_submit"
      v-if="active"
      @click="submitGuess">
      <i class="fas fa-check"></i>
    </button>

  </div>
  `,

  props: ['answerArray'],

  data() {
    return {
      pegArray: [],
      pegColors: [],
      correctColors: 0,
      correctPegs: 0,
      guess: false,
      active: true,
      submitted: false,
      available: false
    }
  },

  mounted() {
    for (var i = 0; i < this.$numOfPegs; i++) {
      this.pegArray.push('code-peg');
    }
  },

  computed: {
    changed() {
      let j = 0;
      for (var i = 0; i < this.pegArray.length; i++) {
        if (this.$children[i].color != 'default') {
          j++;
        }
      }
      if (j == 4) {
        return true;
      }
      else {
        return false;
      }
    }
  },

  methods: {

    makeAvailable() {
      this.available = true;
    },

    submitGuess() {
      if (this.changed) {
        this.available = true;
        this.submitted = true;

        for (var i = 0; i < this.pegArray.length; i++) {
          this.pegColors.push(this.$children[i].color);
          this.$children[i].switchable = false;
        }

        this.checkColors();
        this.checkPegs();

        if (this.correctPegs == this.$numOfPegs) {
          this.guess = true;
          this.$emit('correctGuess')
        }
        else {
          this.active = false;
          this.$emit('wrongGuess', this.pegColors)
        }
      }
      else {
        this.changed = false;
        this.available = false;
      }

    },

    checkColors() {
      var guessMap = {
        'green': 0,
        'blue': 0,
        'yellow': 0,
        'orange': 0,
        'red': 0,
        'purple': 0,
      };

      var answerMap = {
        'green': 0,
        'blue': 0,
        'yellow': 0,
        'orange': 0,
        'red': 0,
        'purple': 0,
      };

      for (var i = 0; i < this.pegColors.length; i++) {
        switch(this.pegColors[i]) {
          case 'green':
            guessMap.green++;
            break;
          case 'blue':
            guessMap.blue++;
            break;
          case 'yellow':
            guessMap.yellow++;
            break;
          case 'orange':
            guessMap.orange++;
            break;
          case 'red':
            guessMap.red++;
            break;
          case 'purple':
            guessMap.purple++;
            break;
        }
      }

      for (var i = 0; i < this.answerArray.length; i++) {
        switch(this.answerArray[i]) {
          case 'green':
            answerMap.green++;
            break;
          case 'blue':
            answerMap.blue++;
            break;
          case 'yellow':
            answerMap.yellow++;
            break;
          case 'orange':
            answerMap.orange++;
            break;
          case 'red':
            answerMap.red++;
            break;
          case 'purple':
            answerMap.purple++;
            break;
        }
      }

      if (answerMap.green > 0) {
        this.correctColors += Math.min(guessMap.green, answerMap.green);
      }
      if (guessMap.blue > 0) {
        this.correctColors += Math.min(guessMap.blue, answerMap.blue);
      }
      if (guessMap.yellow > 0) {
        this.correctColors += Math.min(guessMap.yellow, answerMap.yellow);
      }
      if (guessMap.orange > 0) {
        this.correctColors += Math.min(guessMap.orange, answerMap.orange);
      }
      if (guessMap.red > 0) {
        this.correctColors += Math.min(guessMap.red, answerMap.red);
      }
      if (guessMap.purple > 0) {
        this.correctColors += Math.min(guessMap.purple, answerMap.purple);
      }

    },

    checkPegs() {
      for (var j = 0; j < this.pegArray.length; j++) {
        if (this.pegColors[j] == this.answerArray[j]) {
          this.correctPegs++;
          this.correctColors--;
        }
      }
    }
  }

})

Vue.component('code-peg', {
  props: {
    pegIndex: {
      type: Number,
      required: true
    },
    switchable: {
      type: Boolean,
      required: true
    }
  },
  template: `
  <div class="code_peg" @click="switchColors" :class="color"></div>
  `,
  data() {
    return {
      colorIndex: 0,
      colorArray: ['green', 'blue', 'yellow', 'orange', 'red', 'purple'],
      color: 'default'
    }
  },
  methods: {
    switchColors() {
      if (this.switchable) {
        if (this.colorIndex < this.colorArray.length - 1) {
          this.colorIndex++;
        }
        else {
          this.colorIndex = 0;
        }
        this.color = this.colorArray[this.colorIndex];
      }
    }
  }
})

var app = new Vue({
  el: '#app',
  data: {
    newGame: false,
    init: false
  }
})
