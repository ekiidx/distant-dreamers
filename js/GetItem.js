class GetItem {
    constructor({ item, weapon, onComplete }) {
        if (item) {
            this.item = item || null;
        }

        if (weapon) {
            this.weapon = weapon || null;
        }
        this.onComplete = onComplete;
    }

    done() {
        this.onComplete();
    }

    init() {
        if (this.item) {
            window.playerState.items.push(this.item);
        }

        if (this.weapon) {
            window.playerState.weaponsInventory.push(this.weapon);
        }
       
        this.done();
    }
}