const { createApp } = Vue;

createApp({

    data() {

        return {
            
            // Constants for game setup.
            DEFAULT_N_ROW: 20,
            MIN_N_ROW: 10,
            MAX_N_ROW: 30,
            DEFAULT_N_COL: 20,
            MIN_N_COL: 10,
            MAX_N_COL: 40,
            DEFAULT_N_MINE: 40,
            MIN_N_MINE: 10,
            MIN_N_FREE_CELL: 1,
            
            // Default game setup in initial page load.
            n_row: 20,
            n_col: 20,
            n_mine: 40,
            
            game_controller: new Game_Controller(20, 20, 40)
            
        };

    },

    methods: {
        
        // Resets the game based on the latest configured game setup.
        reset_game() {

            if (!Number.isInteger(this.n_row)) {
                this.n_row = this.DEFAULT_N_ROW;
            } else if (this.n_row < this.MIN_N_ROW) {
                this.n_row = this.MIN_N_ROW;
            } else if (this.n_row > this.MAX_N_ROW) {
                this.n_row = this.MAX_N_ROW;
            }
            
            if (!Number.isInteger(this.n_col)) {
                this.n_col = this.DEFAULT_N_COL;
            } else if (this.n_col < this.MIN_N_COL) {
                this.n_col = this.MIN_N_COL;
            } else if (this.n_col > this.MAX_N_COL) {
                this.n_col = this.MAX_N_COL;
            }
            
            const max_n_mine = this.n_row * this.n_col - this.MIN_N_FREE_CELL;
            if (!Number.isInteger(this.n_mine)) {
                this.n_mine = this.DEFAULT_N_MINE;
            }
            if (this.n_mine < this.MIN_N_MINE) {
                this.n_mine = this.MIN_N_MINE;
            } else if (this.n_mine > max_n_mine) {
                this.n_mine = this.max_n_mine;
            }

            this.game_controller = new Game_Controller(this.n_row, this.n_col, this.n_mine);
        
        },


        // Gets time elapsed from game start.
        // When game concludes with a win or loss, the timestamp would be frozen.
        get_elapsed_time() {
            if (this.game_controller.game_state === Game_Controller.GAME_IN_PROGRESS) {
                return Math.floor((Date.now() - this.game_controller.start_timestamp) / 1000);
            } else {
                return Math.floor((this.game_controller.end_timestamp - this.game_controller.start_timestamp) / 1000); 
            }
        }


    }

}).mount("#app");