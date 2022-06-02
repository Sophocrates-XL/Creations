// The cell class represents an abstract DOM class.
class Cell {

    
    // Static enumerations to be used in development.
    static UNEXPLORED = 0;
    static EXPLORED = 1;
    static FLAGGED = 2;

    static MINE_0 = 0;
    static MINE_1 = 1;
    static MINE_2 = 2;
    static MINE_3 = 3;
    static MINE_4 = 4;
    static MINE_5 = 5;
    static MINE_6 = 6;
    static MINE_7 = 7;
    static MINE_8 = 8;
    static HAS_MINE = 9;
    
    // Source files for rendering.
    static UNEXPLORED_SRC_1 = "./src/unexplored-1.jpg";
    static UNEXPLORED_SRC_2 = "./src/unexplored-2.jpg";
    static FLAGGED_SRC_1 = "./src/flagged-1.jpg";
    static FLAGGED_SRC_2 = "./src/flagged-2.jpg";
    static EXPLORED_SRCS_BY_CELL_TYPE = [...Array(9).keys()].map((i) => `./src/mine-${i}.jpg`)
        .concat("./src/has-mine.jpg");

    
    // Constructor for a new cell where,
    // # cell type covers cells with mines, cells with no mines but with or without mines
    // in adjacent cells.
    // # game controller refers to the controller the cell is attached to for event response.
    // # state refers to whether the cell is unexplored, explored or flagged.
    constructor(cell_type, game_controller, state) {
        
        this.cell_type = cell_type;
        this.game_controller = game_controller;
        this.state = state;
        this.mouse_entered = false;

        this.unexplored_src_1 = Cell.UNEXPLORED_SRC_1;
        this.unexplored_src_2 = Cell.UNEXPLORED_SRC_2;
        this.explored_src = Cell.EXPLORED_SRCS_BY_CELL_TYPE[cell_type];
        this.flagged_src_1 = Cell.FLAGGED_SRC_1;
        this.flagged_src_2 = Cell.FLAGGED_SRC_2;

    }

    
    // Dynamically retrieves suitable rendering source based on cell state.
    get_src() {
        if (this.state === Cell.UNEXPLORED) {
            return this.mouse_entered ? this.unexplored_src_2 : this.unexplored_src_1;
        } else if (this.state === Cell.FLAGGED) {
            return this.mouse_entered ? this.flagged_src_2 : this.flagged_src_1;
        } else {
            return this.explored_src;
        }
    }


    // The cell does not change its own properties, but passes a reference of itself
    // to the game controller to operate.
    post_cell_change() {
        this.game_controller.set_cell_change(this);
    }

    
    // Callback for mouse enter event.
    on_mouseenter() {
        if (this.game_controller.game_state === Game_Controller.GAME_IN_PROGRESS) {
            this.mouse_entered = true;
        }
    }

    
    // Callback for mouse leave event.
    on_mouseleave() {
        if (this.game_controller.game_state === Game_Controller.GAME_IN_PROGRESS) {
            this.mouse_entered = false;
        }
    }
    

    // Callback for left mouse click event. 
    on_click_left() {
        if (this.game_controller.game_state === Game_Controller.GAME_IN_PROGRESS &&
            this.state === Cell.UNEXPLORED) {
            this.post_cell_change();       
        }
    }


    // Callback for right mouse click event.
    on_click_right() {
        if (this.game_controller.game_state === Game_Controller.GAME_IN_PROGRESS) {
            if (this.state === Cell.UNEXPLORED) {
                this.state = Cell.FLAGGED;
            } else if (this.state === Cell.FLAGGED) {
                this.state = Cell.UNEXPLORED;
            }
        }
    }


}


// Game controller represents a grand control over the a game's layout and states,
// which lasts from the game's creation to the game's conclusion.
class Game_Controller {


    // Static enumerations for game state.
    static GAME_IN_PROGRESS = 1;
    static GAME_LOST = 2;
    static GAME_WON = 3;


    // A convenient implementation for sampling used in random mine allocation.
    static sample(values, n_sample) {
        
        const n_value = values.length;
        const selectors = [];

        function sample_selector() {
            let selector = Math.floor(Math.random() * n_value);
            // This handles the exceptional case where Math.random() returns 1 to prevent an out-of-range index.
            // Statistically, this event happens with probability zero.
            // But for programming implementations, there might be a small probability that this happens.
            return Math.min(selector, n_value - 1);
        }
        
        for (let i = 0; i < n_sample; i++) {
            while (true) {
                const selector = sample_selector();
                if (!selectors.includes(selector)) {
                    selectors.push(selector);
                    break;
                }
            }
        }
            
        return selectors.map((selector) => values[selector]);

    }


    // Constructor for game controller.
    constructor(n_row, n_col, n_mine) {
        
        const indices = [...Array(n_row * n_col).keys()];
        const sampled_indices = Game_Controller.sample(indices, n_mine);
        // A n_row * n_col matrix that denotes whether cells have mines.
        // Sets value to true if cell has mine and false if cell does not have mine.
        const mine_state_matrix = [];
        for (let i = 0; i < n_row; i++) {
            mine_state_matrix.push([...Array(n_col).fill(false)]);
        }
        for (let index of sampled_indices) {
            const i = Math.floor(index / n_col);
            const j = index % n_col;
            mine_state_matrix[i][j] = true; 
        }
        
        // A convenient function that calculates the total number of mines in adjacent cells.
        function get_adjacent_mine_count(cell_i, cell_j) {
            let n_mine = 0;
            for (let i = Math.max(0, cell_i - 1); i < Math.min(n_row, cell_i + 2); i++) {
                for (let j = Math.max(0, cell_j - 1); j < Math.min(n_col, cell_j + 2); j++) {
                    if (i !== cell_i || j !== cell_j) {
                        n_mine += mine_state_matrix[i][j] ? 1 : 0;
                    }
                }
            }
            return n_mine;
        }
        
        // A matrix of cell objects to populate the entire game panel.
        const cell_matrix = [];
        for (let i = 0; i < n_row; i++) {
            const cells = [];
            for (let j = 0; j < n_col; j++) {
                if (mine_state_matrix[i][j]) {
                    cells.push(new Cell(Cell.HAS_MINE, this, Cell.UNEXPLORED));
                } else {
                    cells.push(new Cell(get_adjacent_mine_count(i, j), this, Cell.UNEXPLORED));
                }
            }
            cell_matrix.push(cells);
        }

        // n_row: Number of rows of cells.
        // n_col: Number of columns of cells.
        // n_mine: Total number of mines.
        // end_timestamp: only populated when game concludes a win or loss.
        this.n_row = n_row;
        this.n_col = n_col;
        this.n_mine = n_mine;
        this.mine_state_matrix = mine_state_matrix;
        this.cell_matrix = cell_matrix;
        this.game_state = Game_Controller.GAME_IN_PROGRESS;
        this.start_timestamp = Date.now();
        this.end_timestamp = null;

    }

    
    // Retrieves cell position from cell reference.
    get_cell_position(cell) {
        for (let i = 0; i < n_row; i++) {
            for (let j = 0; j < n_col; j++) {
                if (this.cell_matrix[i][j] === cell) {
                    return [i, j];
                }
            }
        }
        return null;
    }
    

    // Calculates number of mine that is not flagged.
    // Does not represent actual number of mine left, since flags may be wrong.
    get_n_mine_left() {
        let n_flag = 0;
        for (let cells of this.cell_matrix) {
            for (let cell of cells) {
                n_flag += cell.state === Cell.FLAGGED ? 1 : 0;
            }
        }
        return this.n_mine - n_flag;
    }


    // Unveils cells that are adjacent to the cell in argument.
    explore_adjacent_cells(cell_i, cell_j) {
        let n_exploration = 0;
        for (let i = Math.max(0, cell_i - 1); i < Math.min(this.n_row, cell_i + 2); i++) {
            for (let j = Math.max(0, cell_j - 1); j < Math.min(this.n_col, cell_j + 2); j++) {
                const cell = this.cell_matrix[i][j];
                if (cell.state === Cell.UNEXPLORED) {
                    cell.state = Cell.EXPLORED;
                    n_exploration += 1;
                }
            }
        }
        return n_exploration;
    }


    // Explores the entire cell matrix, which unveils cells adjacent to cells that
    // have no mines. Since in one step some cells with no mines may be newly unveiled,
    // the algorithm is run recursively until there are no more cells to explore.
    explore_cell_matrix() {
        let n_exploration = 0;
        for (let i = 0; i < this.n_row; i++) {
            for (let j = 0; j < this.n_col; j++) {
                const cell = this.cell_matrix[i][j];
                if (cell.state === Cell.EXPLORED && cell.cell_type === Cell.MINE_0) {
                    n_exploration += this.explore_adjacent_cells(i, j);
                }
            }
        }
        if (n_exploration > 0) {
            this.explore_cell_matrix();
        }
    }


    // Callback function when player clears all cells without mines.
    on_win() {
        this.game_state = Game_Controller.GAME_WON;
        this.end_timestamp = Date.now();
        for (let i = 0; i < this.n_row; i++) {
            for (let j = 0; j < this.n_col; j++) {
                const cell = this.cell_matrix[i][j];
                cell.state = cell.cell_type === Cell.HAS_MINE ? Cell.FLAGGED : Cell.EXPLORED;
            }
        }
    }


    // Callback function when player unveils a cell with mine.
    on_loss() {
        this.game_state = Game_Controller.GAME_LOST;
        this.end_timestamp = Date.now();
        for (let i = 0; i < this.n_row; i++) {
            for (let j = 0; j < this.n_col; j++) {
                this.cell_matrix[i][j].state = Cell.EXPLORED;
            }
        }
    }

    
    // Responds to a post for cell change by cell to manipulate cell properties.   
    set_cell_change(cell) {
        cell.state = Cell.EXPLORED;
        if (cell.cell_type === Cell.HAS_MINE) {
            this.on_loss();
        } else {
            this.explore_cell_matrix();
            let n_remaining_cell = 0;
            for (let cells of this.cell_matrix) {
                for (let cell of cells) {
                    n_remaining_cell += cell.state !== Cell.EXPLORED ? 1 : 0;
                }
            }
            if (n_remaining_cell === this.n_mine) {
                this.on_win();
            }
        }
        
    }

}